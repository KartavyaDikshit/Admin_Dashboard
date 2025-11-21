
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

const TARGET_LANGUAGES = ['de', 'fr', 'it', 'ja', 'ko', 'es', 'pt'];

interface CategoryTranslationPayload {
  title: string;
  description: string;
}

async function translateAndStoreCategory(category: Category, language: string): Promise<void> {
  const contentToTranslate = {
    title: category.name,
    description: category.description || '',
  };

  const prompt = `Translate the following category details into ${language}. Return the response as a valid JSON object with the keys "title" and "description".\n\n${JSON.stringify(
    contentToTranslate,
    null,
    2
  )}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional translator. Your output must be a single, valid JSON object.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const usage = response.usage as OpenAI.CompletionUsage;
    const translatedContentString = response.choices[0]?.message?.content;

    if (!translatedContentString) {
      throw new Error('OpenAI returned empty content.');
    }

    const translatedContent: CategoryTranslationPayload = JSON.parse(translatedContentString);

    await prisma.categoryTranslation.upsert({
      where: { categoryId_locale: { categoryId: category.id, locale: language } },
      update: {
        title: translatedContent.title,
        description: translatedContent.description,
        status: 'APPROVED',
      },
      create: {
        categoryId: category.id,
        locale: language,
        title: translatedContent.title,
        description: translatedContent.description,
        status: 'APPROVED',
      },
    });
    
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
          requestData: prompt,
          responseData: JSON.stringify(response),
        },
      });

  } catch (error) {
    console.error(`Failed to translate category ${category.id} to ${language}:`, error);
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
          requestData: prompt,
          responseData: JSON.stringify(error instanceof Error ? { message: error.message, stack: error.stack } : { message: 'Unknown error' }),
        },
      });
  }
}

interface RouteContext {
  params: { id: string };
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { params } = context;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const category = await prisma.category.findUnique({
      where: { id: params.id },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    await Promise.all(
      TARGET_LANGUAGES.map((lang) => translateAndStoreCategory(category, lang))
    );

    return NextResponse.json({ success: true, message: 'Category translated in all languages.' });
  } catch (error) {
    console.error(`Failed to translate category ${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
