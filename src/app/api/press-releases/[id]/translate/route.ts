import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { openai, calculateCost } from '@/lib/openai';

const TARGET_LANGUAGES = ['de', 'fr', 'it', 'ja', 'ko', 'es'];

const languageMap: { [key: string]: string } = {
  de: 'German',
  fr: 'French',
  it: 'Italian',
  ja: 'Japanese',
  ko: 'Korean',
  es: 'Spanish',
};

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function translateAndStore(pressRelease: any, language: string) {
  const fullLanguageName = languageMap[language] || language;
  
  const prompt = `Translate the following press release into ${fullLanguageName}. Return a valid JSON object with keys: "title", "description".
  
  Title: ${pressRelease.title}
  Description: ${pressRelease.description}`;

  try {
     const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a professional translator. Output valid JSON.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    });

    const usage = response.usage;
    const contentString = response.choices[0]?.message?.content;
    if (!contentString) throw new Error('No content returned');

    const content = JSON.parse(contentString);
    
    await prisma.pressReleaseTranslation.upsert({
      where: { pressReleaseId_locale: { pressReleaseId: pressRelease.id, locale: language } },
      update: {
        title: content.title,
        description: content.description,
      },
      create: {
        pressReleaseId: pressRelease.id,
        locale: language,
        title: content.title,
        description: content.description,
      },
    });
    
     if (usage) {
        const inputTokens = usage.prompt_tokens;
        const outputTokens = usage.completion_tokens;
        const totalTokens = usage.total_tokens;
        const totalCost = calculateCost(inputTokens, outputTokens);
        const costPerToken = totalTokens > 0 ? totalCost / totalTokens : 0;

        await prisma.apiUsageLog.create({
            data: {
            serviceType: 'OPENAI_TRANSLATE',
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
     }

  } catch (error) {
    console.error(`Translation failed for ${language}:`, error);
    throw error;
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const pressRelease = await prisma.pressRelease.findUnique({
      where: { id },
    });

    if (!pressRelease) {
      return NextResponse.json({ error: 'Press release not found' }, { status: 404 });
    }

    await Promise.all(TARGET_LANGUAGES.map(lang => translateAndStore(pressRelease, lang)));

    return NextResponse.json({ success: true, message: 'Press release translated successfully.' });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
