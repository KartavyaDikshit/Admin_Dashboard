import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Category } from '@prisma/client';
import OpenAI from 'openai';
import { calculateCost } from '@/lib/openai'; // Import calculateCost

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const TARGET_LANGUAGES = ['de', 'fr', 'it', 'ja', 'ko', 'es', 'pt']; // Example target languages

interface CategoryTranslationPayload {
  title: string; // Corresponds to Category.name
  description: string;
  seoKeywords: string; // Semicolon-separated string
  metaTitle: string;
  metaDescription: string;
}

async function translateAndStoreCategory(category: Category, language: string): Promise<void> {
  console.log(`[Category ${category.id}] Starting translation for locale: ${language}`);

  const contentToTranslate = {
    name: category.name,
    description: category.description || '',
    seoKeywords: category.seoKeywords.join('; ') || '',
    metaTitle: category.metaTitle || '',
    metaDescription: category.metaDescription || '',
  };

  console.log(`[Category ${category.id}] Content to translate for ${language}:`, JSON.stringify(contentToTranslate, null, 2));

  const prompt = `Translate the following category content into ${language}. Return the response as a valid JSON object with the following keys: "title", "description", "seoKeywords" (as a semicolon-separated string), "metaTitle", "metaDescription".

${JSON.stringify(contentToTranslate, null, 2)}`;

  console.log(`[Category ${category.id}] Prompt for OpenAI for ${language}:`, prompt);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional translator specializing in SEO and category descriptions. Your output must be a single, valid JSON object.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    console.log(`[Category ${category.id}] Raw OpenAI response for ${language}:`, JSON.stringify(response, null, 2));

    const usage = response.usage as OpenAI.CompletionUsage;
    const translatedContentString = response.choices[0]?.message?.content;

    if (!translatedContentString) {
      console.error(`[Category ${category.id}] OpenAI returned empty content for ${language}.`);
      throw new Error('OpenAI returned empty content.');
    }

    console.log(`[Category ${category.id}] Translated content string from OpenAI for ${language}:`, translatedContentString);

    const translatedContent: CategoryTranslationPayload = JSON.parse(translatedContentString);
    console.log(`[Category ${category.id}] Parsed translated content from OpenAI for ${language}:`, JSON.stringify(translatedContent, null, 2));

    // Helper to parse semicolon-separated strings to arrays
    const parseStringToArray = (str: string) => {
      const arr = str.split(';').map(s => s.trim()).filter(s => s.length > 0);
      console.log(`Parsed string to array: "${str}" ->`, arr);
      return arr;
    };

    const finalTranslatedContent = {
      title: translatedContent.title,
      description: translatedContent.description,
      seoKeywords: parseStringToArray(translatedContent.seoKeywords),
      metaTitle: translatedContent.metaTitle,
      metaDescription: translatedContent.metaDescription,
    };

    console.log(`[Category ${category.id}] Final content for Prisma upsert for ${language}:`, JSON.stringify(finalTranslatedContent, null, 2));

    console.log(`[Category ${category.id}] Prisma upsert WHERE clause for ${language}:`, { categoryId_locale: { categoryId: category.id, locale: language } });
    // console.log(`[Category ${category.id}] Prisma upsert DATA for ${language}:`, { ...finalTranslatedContent, aiGenerated: true, status: 'APPROVED' });

    await prisma.categoryTranslation.upsert({
      where: { categoryId_locale: { categoryId: category.id, locale: language } },
      update: {
        ...finalTranslatedContent,
        status: 'APPROVED',
      },
      create: {
        categoryId: category.id,
        locale: language,
        ...finalTranslatedContent,
        status: 'APPROVED',
      },
    });
    console.log(`[Category ${category.id}] Successfully upserted translation for ${language}.`);

    const inputTokens = usage.prompt_tokens;
    const outputTokens = usage.completion_tokens;
    const totalTokens = usage.total_tokens;
    const totalCost = calculateCost(inputTokens, outputTokens);
    const costPerToken = totalTokens > 0 ? totalCost / totalTokens : 0;

    await prisma.apiUsageLog.create({
        data: {
          serviceType: 'OPENAI_TRANSLATE_CATEGORY',
          model: response.model,
          inputTokens: inputTokens,
          outputTokens: outputTokens,
          totalTokens: totalTokens,
          costPerToken: costPerToken,
          totalCost: totalCost,
          success: true,
          responseTime: 0,
        },
      });
    console.log(`[Category ${category.id}] API usage logged for ${language}.`);

  } catch (error) {
    console.error(`[Category ${category.id}] Failed to translate category ${category.id} to ${language}:`, error);
    // Log failed API usage
    await prisma.apiUsageLog.create({
        data: {
          serviceType: 'OPENAI_TRANSLATE_CATEGORY',
          model: 'gpt-4o-mini',
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          costPerToken: 0,
          totalCost: 0,
          success: false,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          responseTime: 0,
        },
      });
  }
}

interface RouteContext {
  params: { id: string };
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { params } = context;
  const { id } = params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const category = await prisma.category.findUnique({
      where: { id: id },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Run translations in parallel
    await Promise.all(
      TARGET_LANGUAGES.map((lang) => translateAndStoreCategory(category, lang))
    );

    // Optionally, update the main category status or a translation status
    // For now, just return success.

    return NextResponse.json({ success: true, message: 'Category translation initiated for all languages.' });
  } catch (error) {
    console.error(`Failed to initiate category translation for ${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

