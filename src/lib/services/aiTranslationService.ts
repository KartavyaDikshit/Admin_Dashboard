import { openai, estimateTokenCount, calculateCost, MODEL_NAME } from '@/lib/openai';
import { prisma } from '@/lib/prisma';
import { TranslationJobStatus, TranslationStatus, Report, Category, TranslationJob } from '@prisma/client';
import { generateSlug } from '@/lib/utils';
import { getCostPerToken } from '@/lib/services/apiUsageLogService';

export class AITranslationService {
  async translateContent(
    contentType: 'REPORT' | 'CATEGORY',
    contentId: string,
    targetLocale: string,
    sourceLocale: string = 'en', // Assuming English as default source
    batchId: string | null = null // Add batchId parameter here
  ) {
    try {
      // 1. Fetch Source Content
      let originalContent: Report | Category
      let fieldsToTranslate: { key: string; value: string }[] = []
      let baseModel: Report | Category

      if (contentType === 'REPORT') {
        baseModel = await prisma.report.findUnique({
          where: { id: contentId },
          select: {
            id: true,
            title: true,
            description: true,
            summary: true,
            metaTitle: true,
            metaDescription: true,
            slug: true,
          },
        }) as Report;
        if (!baseModel) throw new Error('Report not found')
        originalContent = baseModel

        fieldsToTranslate = [
          { key: 'title', value: originalContent.title },
          { key: 'description', value: originalContent.description },
          { key: 'summary', value: originalContent.summary || '' },
          { key: 'metaTitle', value: originalContent.metaTitle },
          { key: 'metaDescription', value: originalContent.metaDescription },
        ]
      } else if (contentType === 'CATEGORY') {
        baseModel = await prisma.category.findUnique({
          where: { id: contentId },
          select: {
            id: true,
            title: true,
            description: true,
            metaTitle: true,
            metaDescription: true,
            slug: true,
          },
        }) as Category;
        if (!baseModel) throw new Error('Category not found')
        originalContent = baseModel

        fieldsToTranslate = [
          { key: 'title', value: originalContent.title },
          { key: 'description', value: originalContent.description || '' },
          { key: 'metaTitle', value: originalContent.metaTitle || '' },
          { key: 'metaDescription', value: originalContent.metaDescription || '' },
        ]
      } else {
        throw new Error('Invalid content type')
      }

      const originalTextInput = JSON.stringify(
        fieldsToTranslate.reduce((acc, field) => ({ ...acc, [field.key]: field.value }), {})
      )
      console.log('Original Text Input for Translation:', originalTextInput); // Debug log

      // 2. Check for Existing Translation
      const existingTranslationJob = await prisma.translationJob.findFirst({
        where: {
          contentId,
          contentType,
          targetLocale,
          status: {
            in: [TranslationJobStatus.PENDING, TranslationJobStatus.PROCESSING, TranslationJobStatus.COMPLETED],
          },
        },
      })

      if (existingTranslationJob && existingTranslationJob.status === TranslationJobStatus.COMPLETED) {
        console.log(`Translation for ${contentType} ${contentId} to ${targetLocale} already completed.`)
        return existingTranslationJob
      }

      // 3. Create/Update TranslationJob
      const jobData = {
        contentType,
        contentId,
        sourceLocale,
        targetLocale,
        fieldName: 'all_translatable_fields', // Indicate all fields are being translated
        originalText: originalTextInput,
        aiModel: MODEL_NAME,
        promptTemplate: 'Translate the following JSON object into {targetLocale}. Maintain the JSON structure and translate only the values.',
        status: TranslationJobStatus.PENDING,
        batchId, // Store batchId
      }

      let translationJob: TranslationJob
      if (existingTranslationJob) {
        translationJob = await prisma.translationJob.update({
          where: { id: existingTranslationJob.id },
          data: { ...jobData, status: TranslationJobStatus.PROCESSING },
        })
      } else {
        translationJob = await prisma.translationJob.create({
          data: { ...jobData, status: TranslationJobStatus.PROCESSING },
        })
      }

      // 4. Construct OpenAI Prompt - REFINED
      const systemMessageContent = `You are an expert translator. Your task is to translate a JSON object from ${sourceLocale} to ${targetLocale}.
      You MUST maintain the exact JSON structure and only translate the values of the fields.
      For the 'slug' field, you MUST generate a new, SEO-friendly slug based on the translated 'title' for the ${targetLocale} language. The slug should be lowercase, use hyphens instead of spaces, and remove any special characters.
      Ensure the output is a valid JSON object.`

      const userMessageContent = `Please translate the following JSON object:

${originalTextInput}`

      console.log('System Message:', systemMessageContent); // Debug log
      console.log('User Message (Prompt to OpenAI):', userMessageContent); // Debug log

      // 5. Call OpenAI API
      const startTime = Date.now()
      let completion;
      try {
        completion = await openai.chat.completions.create({
          model: MODEL_NAME,
          messages: [
            {
              role: 'system',
              content: systemMessageContent
            },
            {
              role: 'user',
              content: userMessageContent,
            },
          ],
          max_tokens: 8000, // Increased from 4000
          temperature: 0.3,
          response_format: { type: "json_object" },
        })
        console.log('Raw OpenAI Completion Response:', JSON.stringify(completion, null, 2)); // Debug log
      } catch (openaiError: unknown) {
        const message = openaiError instanceof Error ? openaiError.message : String(openaiError);
        console.error('OpenAI API Call Error:', openaiError); // Debug log
        throw new Error(`OpenAI API call failed: ${message}`);
      }


      const translatedOutputText = completion.choices[0]?.message?.content || ''
      console.log('Translated Output Text (raw from OpenAI):', translatedOutputText); // Debug log
      let translatedFields: Record<string, string>;

      try {
        translatedFields = JSON.parse(translatedOutputText)
        console.log('Parsed Translated Fields:', translatedFields); // Debug log
      } catch (parseError: unknown) {
        const message = parseError instanceof Error ? parseError.message : 'An unknown error occurred';
        console.error('Failed to parse OpenAI response as JSON:', parseError)
        console.error('Problematic OpenAI response:', translatedOutputText); // Log the problematic response
        throw new Error(`AI response was not valid JSON. Error: ${message}. Response: ${translatedOutputText.substring(0, 200)}...`)
      }

      // Generate SEO-friendly slug from translated title - REFINED
      if (translatedFields.title) {
        translatedFields.slug = generateSlug(translatedFields.title)
      } else if (baseModel.slug) {
        // Fallback if title not translated or missing, use original slug
        translatedFields.slug = generateSlug(baseModel.slug) // Ensure fallback slug is also generated properly
      }
      console.log('Final Translated Fields with generated slug:', translatedFields); // Debug log


      // 6. Calculate Tokens and Cost
      const inputTokens = completion.usage?.prompt_tokens || estimateTokenCount(userMessageContent)
      const outputTokens = completion.usage?.completion_tokens || estimateTokenCount(translatedOutputText)
      const totalTokens = completion.usage?.total_tokens || inputTokens + outputTokens
      const cost = calculateCost(inputTokens, outputTokens)
      const processingTime = Date.now() - startTime
      const costPerToken = await getCostPerToken(MODEL_NAME);

      // 7. Update TranslationJob and Log API Usage
      await prisma.$transaction([
        prisma.translationJob.update({
          where: { id: translationJob.id },
          data: {
            translatedText: translatedOutputText,
            inputTokens,
            outputTokens,
            totalTokens,
            actualCost: cost,
            processingTime,
            status: TranslationJobStatus.COMPLETED,
          },
        }),
        prisma.apiUsageLog.create({
          data: {
            serviceType: 'TRANSLATION',
            model: MODEL_NAME,
            jobId: translationJob.id,
            inputTokens: inputTokens,
            outputTokens: outputTokens,
            totalTokens: totalTokens,
            costPerToken: costPerToken, 
            totalCost: cost,
            responseTime: processingTime,
            success: true,
          },
        }),
      ]);

      // 8. Create/Update *Translation Entry
      if (contentType === 'REPORT') {
        await prisma.reportTranslation.upsert({
          where: {
            reportId_locale: {
              reportId: contentId,
              locale: targetLocale,
            },
          },
          update: {
            title: translatedFields.title,
            description: translatedFields.description,
            summary: translatedFields.summary,
            slug: translatedFields.slug,
            metaTitle: translatedFields.metaTitle,
            metaDescription: translatedFields.metaDescription,
            aiGenerated: true,
            status: TranslationStatus.PENDING_REVIEW,
          },
          create: {
            reportId: contentId,
            locale: targetLocale,
            title: translatedFields.title,
            description: translatedFields.description,
            summary: translatedFields.summary,
            slug: translatedFields.slug,
            metaTitle: translatedFields.metaTitle,
            metaDescription: translatedFields.metaDescription,
            aiGenerated: true,
            status: TranslationStatus.PENDING_REVIEW,
          },
        })
      } else if (contentType === 'CATEGORY') {
        await prisma.categoryTranslation.upsert({
          where: {
            categoryId_locale: {
              categoryId: contentId,
              locale: targetLocale,
            },
          },
          update: {
            title: translatedFields.title,
            description: translatedFields.description,
            slug: translatedFields.slug,
            metaTitle: translatedFields.metaTitle,
            metaDescription: translatedFields.metaDescription,
            aiGenerated: true,
            status: TranslationStatus.PENDING_REVIEW,
          },
          create: {
            categoryId: contentId,
            locale: targetLocale,
            title: translatedFields.title,
            description: translatedFields.description,
            slug: translatedFields.slug,
            metaTitle: translatedFields.metaTitle,
            metaDescription: translatedFields.metaDescription,
            aiGenerated: true,
            status: TranslationStatus.PENDING_REVIEW,
          },
        })
      }

      return translationJob
    } catch (error: unknown) {
      console.error(`Error translating ${contentType} ${contentId} to ${targetLocale}:`, error)
      
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      const translationJobId = error && typeof error === 'object' && 'translationJobId' in error ? String((error as { translationJobId: unknown }).translationJobId) : undefined;

      // Update job status to FAILED if an ID exists
      if (translationJobId) {
        await prisma.translationJob.update({
          where: { id: translationJobId },
          data: {
            status: TranslationJobStatus.FAILED,
            errorMessage: errorMessage,
          },
        })
      } else if (errorMessage.includes('AI response was not valid JSON')) {
         // If it's a JSON parsing error, we might not have the job ID in the error object
         // Try to find the job by contentId, contentType, targetLocale and update it
         const jobToUpdate = await prisma.translationJob.findFirst({
            where: {
                contentId,
                contentType,
                targetLocale,
                status: TranslationJobStatus.PROCESSING // Assuming it was in processing state
            }
         });
         if (jobToUpdate) {
            await prisma.translationJob.update({
                where: { id: jobToUpdate.id },
                data: {
                    status: TranslationJobStatus.FAILED,
                    errorMessage: errorMessage,
                },
            });
         }
      }
      throw error
    }
  }
}

export const aiTranslationService = new AITranslationService()