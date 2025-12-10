
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';
import { generateSlug, generateSKU } from '@/lib/utils';
import { calculateCost, openai } from '@/lib/openai'; // Import openai and calculateCost

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
  prompt: string,
  sectionTitle: string
): Promise<{ content: string; usage: OpenAI.CompletionUsage }> {
  // Inject formatting and length instructions to override any restrictive DB prompts
  const enhancedPrompt = `
Report Title: ${reportTitle}

${prompt}

IMPORTANT INSTRUCTIONS:
1. Ignore any constraints about word count (e.g., "under 300 words"). Write a detailed, comprehensive, and extensive section.
2. EXPAND on every point. Provide deep analysis, specific examples, and theoretical backing for every claim.
3. Aim for a very long, in-depth response. Do not summarize or be concise. Be verbose.
4. Format the output using HTML tags for structure and readability:
   - Use <h3> for main headings.
   - Use <h4> for sub-headings.
   - Use <p> for paragraphs.
   - Use <ul> and <li> for lists.
   - Use <strong> for emphasis.
   - Do NOT use Markdown (e.g., **, ##). Output raw HTML.
5. Ensure the tone is professional and suitable for C-level executives.
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert market research analyst. Generate the "${sectionTitle}" section for a report titled "${reportTitle}". You must output valid HTML content (without <html> or <body> tags, just the inner content).`,
        },
        { role: 'user', content: enhancedPrompt },
      ],
      temperature: 0.7, // Slightly higher for more creative/longer output
      max_tokens: 4096, // Increased from 1024
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
        responseTime: 0, // You could calculate this
        requestData: enhancedPrompt,
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
    const failedCostPerToken = 0; // Since totalTokens is 0

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
          requestData: enhancedPrompt,
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
