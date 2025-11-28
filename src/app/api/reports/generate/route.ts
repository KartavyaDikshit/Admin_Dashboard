
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';
import { generateSlug, generateSKU } from '@/lib/utils';
import { calculateCost, openai } from '@/lib/openai'; // Import openai and calculateCost

// Helper function to get prompt content
async function getPrompt(promptName: string): Promise<string> {
  const promptsDir = path.join(process.cwd(), 'prompts');
  const filePath = path.join(promptsDir, `${promptName}.txt`);
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    console.error(`Error reading prompt ${promptName}:`, error);
    throw new Error(`Could not read prompt file: ${promptName}`);
  }
}

// Helper function to call OpenAI and log usage
async function generateSection(
  reportTitle: string,
  prompt: string,
  sectionTitle: string
): Promise<{ content: string; usage: OpenAI.CompletionUsage }> {
  const fullPrompt = `Report Title: ${reportTitle}\n\n${prompt}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert market research analyst. Generate the "${sectionTitle}" section for a report titled "${reportTitle}".`,
        },
        { role: 'user', content: fullPrompt },
      ],
      temperature: 0.5,
      max_tokens: 1024,
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
        requestData: fullPrompt,
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
          requestData: fullPrompt,
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
