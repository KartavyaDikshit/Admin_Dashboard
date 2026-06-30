
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';
import { generateSlug, generateSKU, getMarketYears } from '@/lib/utils';
import { calculateCost, openai } from '@/lib/openai'; // Import openai and calculateCost

export const maxDuration = 800; // Updated to match VPS Enhanced limit

// Helper function to get prompt content from DB
async function getPrompt(promptName: string): Promise<string> {
  try {
    const template = await prisma.aiPromptTemplate.findUnique({
      where: { name: promptName },
    });

    if (!template) {
      throw new Error(`Prompt template '${promptName}' not found in database.`);
    }

    return template.templateText;
  } catch (error) {
    console.error(`Error fetching prompt ${promptName}:`, error);
    throw error;
  }
}

// Helper function to call OpenAI and log usage
async function generateSection(
  reportTitle: string,
  rawPrompt: string,
  sectionTitle: string
): Promise<{ content: string; usage: OpenAI.CompletionUsage }> {
  console.log(`Generating section '${sectionTitle}' with prompt length: ${rawPrompt.length}`);

  if (!rawPrompt || rawPrompt.trim() === '') {
    console.log(`Skipping section '${sectionTitle}' because prompt is empty.`);
    return {
      content: '',
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 } as OpenAI.CompletionUsage
    };
  }

  // 1. Replace placeholders in the prompt
  const { currentYear, forecastStartYear, forecastEndYear, forecastPeriod } = getMarketYears();
  const processedPrompt = rawPrompt
    .replace(/{title}/g, reportTitle)
    .replace(/{currentYear}/g, currentYear.toString())
    .replace(/{forecastStartYear}/g, forecastStartYear.toString())
    .replace(/{forecastEndYear}/g, forecastEndYear.toString())
    .replace(/{forecastPeriod}/g, forecastPeriod);

  // 2. Create the final user message.
  // We prepend the Context but trust the prompt's internal instructions (which are editable in Admin)
  // rather than overriding them with hardcoded "IMPORTANT INSTRUCTIONS".
  const finalUserMessage = `
Context:
Report Title: "${reportTitle}"
Section: "${sectionTitle}"

Task:
${processedPrompt}
`;

  const systemPrompt = `
You are a Senior Market Research Analyst.
Your goal is to generate high-quality, data-driven market research content based EXACTLY on the provided instructions.
- Adopt a professional, authoritative, and C-level executive tone.
- If the prompt asks for specific formatting (e.g., lists, specific headers), FOLLOW IT PRECISELY.
- If the prompt asks for data/estimates and you don't have real-time access, use your training data to provide realistic, high-confidence estimates.
- Do not output markdown code blocks (like \`\`\`html). Output raw content (HTML tags are okay if requested).
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        { role: 'user', content: finalUserMessage },
      ],
      temperature: 0.7, // Slightly reduced to stick closer to instructions/facts
      presence_penalty: 0.0,
      frequency_penalty: 0.0,
      max_tokens: 4096,
    });

    const content = response.choices[0]?.message?.content?.trim() ?? '';
    const usage = response.usage as OpenAI.CompletionUsage;

    // Log API usage
    const inputTokens = usage.prompt_tokens;
    const outputTokens = usage.completion_tokens;
    const totalTokens = usage.total_tokens;
    const totalCost = calculateCost(inputTokens, outputTokens);
    const costPerToken = totalTokens > 0 ? totalCost / totalTokens : 0;

    await prisma.apiUsageLog.create({
      data: {
        serviceType: 'OPENAI_GENERATE_REPORT',
        model: response.model,
        inputTokens: inputTokens,
        outputTokens: outputTokens,
        totalTokens: totalTokens,
        costPerToken: costPerToken,
        totalCost: totalCost,
        success: true,
        responseTime: 0, 
        requestData: finalUserMessage,
        responseData: JSON.stringify(response),
      },
    });

    return { content, usage };
  } catch (error) {
    console.error(`Error generating section "${sectionTitle}" with OpenAI:`, error);
    // Log failed API usage
    const failedInputTokens = 0;
    const failedOutputTokens = 0;
    const failedTotalTokens = 0;
    const failedTotalCost = calculateCost(failedInputTokens, failedOutputTokens);
    const failedCostPerToken = 0; 

    await prisma.apiUsageLog.create({
        data: {
          serviceType: 'OPENAI_GENERATE_REPORT',
          model: 'gpt-4o-mini',
          inputTokens: failedInputTokens,
          outputTokens: failedOutputTokens,
          totalTokens: failedTotalTokens,
          costPerToken: failedCostPerToken,
          totalCost: failedTotalCost,
          success: false,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          responseTime: 0,
          requestData: 'Error in generation', // simpler log for error
          responseData: JSON.stringify(error instanceof Error ? { message: error.message, stack: error.stack } : { message: 'Unknown error' }),
        },
      });
    throw new Error(`Failed to generate content for section: ${sectionTitle}`);
  }
}

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy-key') {
      return NextResponse.json({ error: 'OpenAI API Key not configured properly.' }, { status: 500 });
    }

    const { title } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // 1. Read all prompts
    const [prompt1, prompt2, prompt3, prompt4] = await Promise.all([
      getPrompt('prompt1'),
      getPrompt('prompt2'),
      getPrompt('prompt3'),
      getPrompt('prompt4'),
    ]);

    // 2. Generate all sections in parallel
    const [
      marketResearchSummaryResult,
      marketDynamicsResult,
      regionalInsightsResult,
      keyMarketPlayersResult,
    ] = await Promise.all([
      generateSection(title, prompt1, 'Market Research Summary'),
      generateSection(title, prompt2, 'Market Dynamics'),
      generateSection(title, prompt3, 'Regional Insights'),
      generateSection(title, prompt4, 'Key Market Players'),
    ]);

    // 3. Create the report in the database
    const baseSlug = generateSlug(title);
    let slug = baseSlug;
    let counter = 1;

    // Ensure slug uniqueness
    while (await prisma.report.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const newReport = await prisma.report.create({
      data: {
        title,
        slug,
        description: '', // Admin can fill this in later
        publishedDate: new Date(),
        aiGenerated: true,
        status: 'DRAFT',
        marketResearchSummary: marketResearchSummaryResult.content,
        marketDynamics: marketDynamicsResult.content,
        regionalInsights: regionalInsightsResult.content,
        keyMarketPlayers: keyMarketPlayersResult.content,
        sku: generateSKU(title),
        metaTitle: title,
        metaDescription: '', // Admin can fill this in later
      },
    });

    return NextResponse.json(newReport, { status: 201 });
  } catch (error) {
    console.error('Failed to generate report:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    );
  }
}
