
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Report, Prisma } from '@prisma/client';
import OpenAI from 'openai';
import { generateSlug } from '@/lib/utils';
import { calculateCost, openai } from '@/lib/openai'; // Import openai and calculateCost

const TARGET_LANGUAGES = ['de', 'fr', 'it', 'ja', 'ko', 'es']; // 7 languages

interface RecentStrategicDevelopment {
  date: string;
  event: string;
}

// Define JsonObject as Record<string, any> directly if needed, or remove if not used
type JsonObject = Record<string, unknown>;

interface TranslationPayload {
  title: string;
  description: string;
  summary: string;
  recentStrategicDevelopments: RecentStrategicDevelopment[] | string; // Can be array or JSON string
  marketResearchSummary: string;
  marketDynamics: string;
  regionalInsights: string;
  keyMarketPlayers: string;
  tableOfContents: string;
  listOfFigures: string;
  methodology: string;
  keyFindings: string; // Will be semicolon-separated string from OpenAI
  executiveSummary: string;
  keywords: string; // Will be semicolon-separated string from OpenAI
  semanticKeywords: string; // Will be semicolon-separated string from OpenAI
  localizedKeywords: string; // Will be semicolon-separated string from OpenAI
  culturalKeywords: string; // Will be semicolon-separated string from OpenAI
  longTailKeywords: string; // Will be semicolon-separated string from OpenAI
  localCompetitorKeywords: string; // Will be semicolon-separated string from OpenAI
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  schemaMarkup: JsonObject | string; // Can be object or JSON string
  breadcrumbData: JsonObject | string; // Can be object or JSON string
  faqData: JsonObject | string; // Can be object or JSON string
  localBusinessSchema: JsonObject | string; // Can be object or JSON string
}

// Helper function to safely parse JSON values from report properties
function parseReportJsonField<T>(field: Prisma.JsonValue | undefined | null, defaultValue: T): T {
  if (field === null || field === undefined) {
    return defaultValue;
  }
  if (typeof field === 'string') {
    try {
      return JSON.parse(field) as T;
    } catch (e) {
      console.error('Failed to parse JSON string from report field:', e);
      return defaultValue;
    }
  }
  return field as T;
}

const languageMap: { [key: string]: string } = {
  de: 'German',
  fr: 'French',
  it: 'Italian',
  ja: 'Japanese',
  ko: 'Korean',
  es: 'Spanish',
};

// Helper function to translate and store
async function translateAndStore(report: Report, language: string): Promise<void> {
  console.log(`[${report.id}] Starting translation for locale: ${language}`);

  const contentToTranslate = {
    title: report.title,
    description: report.description,
    summary: report.summary || '',
    recentStrategicDevelopments: parseReportJsonField(report.recentStrategicDevelopments, [] as RecentStrategicDevelopment[]),
    marketResearchSummary: report.marketResearchSummary || '',
    marketDynamics: report.marketDynamics || '',
    regionalInsights: report.regionalInsights || '',
    keyMarketPlayers: report.keyMarketPlayers || '',
    tableOfContents: report.tableOfContents || '',
    listOfFigures: report.listOfFigures || '',
    methodology: report.methodology || '',
    keyFindings: report.keyFindings.join('; ') || '',
    executiveSummary: report.executiveSummary || '',
    keywords: report.keywords.join('; ') || '',
    semanticKeywords: report.semanticKeywords.join('; ') || '',
    longTailKeywords: report.longTailKeywords.join('; ') || '',
    metaTitle: report.metaTitle,
    metaDescription: report.metaDescription,
    canonicalUrl: report.canonicalUrl || '',
    ogTitle: report.ogTitle || '',
    ogDescription: report.ogDescription || '',
    ogImage: report.ogImage || '',
    twitterTitle: report.twitterTitle || '',
    twitterDescription: report.twitterDescription || '',
    schemaMarkup: parseReportJsonField(report.schemaMarkup, {} as JsonObject),
    breadcrumbData: parseReportJsonField(report.breadcrumbData, {} as JsonObject),
    faqData: parseReportJsonField(report.faqData, {} as JsonObject),
  };




  console.log(`[${report.id}] Content to translate for ${language}:`, JSON.stringify(contentToTranslate, null, 2));

  const fullLanguageName = languageMap[language] || language;
  const prompt = `Translate the following report content into ${fullLanguageName}. Return the response as a valid JSON object with the following keys: "title", "description", "summary", "recentStrategicDevelopments" (as a JSON string representing an array of objects with "date" and "event" keys), "marketResearchSummary", "marketDynamics", "regionalInsights", "keyMarketPlayers", "tableOfContents", "listOfFigures", "methodology", "keyFindings" (as a semicolon-separated string), "executiveSummary", "keywords" (as a semicolon-separated string), "semanticKeywords" (as a semicolon-separated string), "localizedKeywords" (as a semicolon-separated string), "culturalKeywords" (as a semicolon-separated string), "longTailKeywords" (as a semicolon-separated string), "localCompetitorKeywords" (as a semicolon-separated string), "metaTitle", "metaDescription", "canonicalUrl", "ogTitle", "ogDescription", "ogImage", "twitterTitle", "twitterDescription", "schemaMarkup" (as a JSON string), "breadcrumbData" (as a JSON string), "faqData" (as a JSON string), "localBusinessSchema" (as a JSON string).\n\n${JSON.stringify(
    {
      ...contentToTranslate,
      recentStrategicDevelopments: JSON.stringify(contentToTranslate.recentStrategicDevelopments),
      schemaMarkup: JSON.stringify(contentToTranslate.schemaMarkup),
      breadcrumbData: JSON.stringify(contentToTranslate.breadcrumbData),
      faqData: JSON.stringify(contentToTranslate.faqData),
    },
    null,
    2
  )}`;

  console.log(`[${report.id}] Prompt for OpenAI for ${language}:`, prompt);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional translator specializing in business and market research reports. Your output must be a single, valid JSON object.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    console.log(`[${report.id}] Raw OpenAI response for ${language}:`, JSON.stringify(response, null, 2));

    const usage = response.usage as OpenAI.CompletionUsage;
    const translatedContentString = response.choices[0]?.message?.content;

    if (!translatedContentString) {
      console.error(`[${report.id}] OpenAI returned empty content for ${language}.`);
      throw new Error('OpenAI returned empty content.');
    }

    console.log(`[${report.id}] Translated content string from OpenAI for ${language}:`, translatedContentString);

    const translatedContent: TranslationPayload = JSON.parse(translatedContentString);
    console.log(`[${report.id}] Parsed translated content from OpenAI for ${language}:`, JSON.stringify(translatedContent, null, 2));

    // Parse recentStrategicDevelopments back to array of objects
    let parsedRecentStrategicDevelopments: RecentStrategicDevelopment[] = [];
    try {
      parsedRecentStrategicDevelopments = JSON.parse(translatedContent.recentStrategicDevelopments as string);
      console.log(`[${report.id}] Parsed recentStrategicDevelopments for ${language}:`, parsedRecentStrategicDevelopments);
    } catch (e) {
      console.error(`[${report.id}] Failed to parse recentStrategicDevelopments for ${language}:`, e);
    }

    // Helper to parse semicolon-separated strings to arrays
    const parseStringToArray = (str: string) => {
      const arr = str.split(';').map(s => s.trim()).filter(s => s.length > 0);
      console.log(`Parsed string to array: "${str}" ->`, arr);
      return arr;
    };

    // Helper to parse JSON strings to objects
    const parseJsonString = (jsonStr: string): JsonObject => {
      try {
        const obj = JSON.parse(jsonStr);
        console.log(`Parsed JSON string: "${jsonStr}" ->`, obj);
        return obj;
      } catch (e) {
        console.error(`Failed to parse JSON string "${jsonStr}":`, e);
        return {};
      }
    };

    const finalTranslatedContent = {
      title: translatedContent.title,
      description: translatedContent.description,
      summary: translatedContent.summary,
      recentStrategicDevelopments: parsedRecentStrategicDevelopments,
      marketResearchSummary: translatedContent.marketResearchSummary,
      marketDynamics: translatedContent.marketDynamics,
      regionalInsights: translatedContent.regionalInsights,
      keyMarketPlayers: translatedContent.keyMarketPlayers,
      keyPlayers: parseStringToArray(translatedContent.keyMarketPlayers ?? ''),
      tableOfContents: translatedContent.tableOfContents,
      listOfFigures: translatedContent.listOfFigures,
      methodology: translatedContent.methodology,
      keyFindings: parseStringToArray(translatedContent.keyFindings ?? ''),
      executiveSummary: translatedContent.executiveSummary,
      keywords: parseStringToArray(translatedContent.keywords ?? ''),
      semanticKeywords: parseStringToArray(translatedContent.semanticKeywords ?? ''),
      localizedKeywords: parseStringToArray(translatedContent.localizedKeywords ?? ''),
      culturalKeywords: parseStringToArray(translatedContent.culturalKeywords ?? ''),
      longTailKeywords: parseStringToArray(translatedContent.longTailKeywords ?? ''),
      localCompetitorKeywords: parseStringToArray(translatedContent.localCompetitorKeywords ?? ''),
      metaTitle: translatedContent.metaTitle,
      metaDescription: translatedContent.metaDescription,
      canonicalUrl: translatedContent.canonicalUrl,
      ogTitle: translatedContent.ogTitle,
      ogDescription: translatedContent.ogDescription,
      ogImage: translatedContent.ogImage,
      twitterTitle: translatedContent.twitterTitle,
      twitterDescription: translatedContent.twitterDescription,
      schemaMarkup: parseJsonString(translatedContent.schemaMarkup as string),
      breadcrumbData: parseJsonString(translatedContent.breadcrumbData as string),
      faqData: parseJsonString(translatedContent.faqData as string),
      localBusinessSchema: parseJsonString(translatedContent.localBusinessSchema as string),
    };

    const finalTranslatedContentForPrisma = {
      ...finalTranslatedContent,
      recentStrategicDevelopments: finalTranslatedContent.recentStrategicDevelopments as unknown as Prisma.InputJsonValue,
      schemaMarkup: finalTranslatedContent.schemaMarkup as unknown as Prisma.InputJsonValue,
      breadcrumbData: finalTranslatedContent.breadcrumbData as unknown as Prisma.InputJsonValue,
      faqData: finalTranslatedContent.faqData as unknown as Prisma.InputJsonValue,
      localBusinessSchema: finalTranslatedContent.localBusinessSchema as unknown as Prisma.InputJsonValue,
    };

    console.log(`[${report.id}] Final content for Prisma upsert for ${language}:`, JSON.stringify(finalTranslatedContentForPrisma, null, 2));

    console.log(`[${report.id}] Attempting upsert for translation for locale: ${language} with data:`, {
      reportId: report.id,
      locale: language,
      finalTranslatedContent: finalTranslatedContentForPrisma,
    });

    await prisma.reportTranslation.upsert({
      where: { reportId_locale: { reportId: report.id, locale: language } },
      update: {
        ...finalTranslatedContentForPrisma,
        slug: generateSlug(translatedContent.title),
        aiGenerated: true,
        status: 'APPROVED',
      },
      create: {
        reportId: report.id,
        locale: language,
        ...finalTranslatedContentForPrisma,
        slug: generateSlug(translatedContent.title),
        aiGenerated: true,
        status: 'APPROVED',
      },
    });
    console.log(`[${report.id}] Successfully upserted translation for ${language}.`);

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
    console.log(`[${report.id}] API usage logged for ${language}.`);

  } catch (error) {
    console.error(`[${report.id}] Failed to translate report ${report.id} to ${language}:`, error);
    // Log failed API usage
    await prisma.apiUsageLog.create({
        data: {
          serviceType: 'OPENAI_TRANSLATE',
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
    throw error; // Re-throw the error to be caught by Promise.all
  }
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const report = await prisma.report.findUnique({
      where: { id: id },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy-key') {
      return NextResponse.json({ error: 'OpenAI API Key not configured properly.' }, { status: 500 });
    }

    // Run translations in parallel
    try {
      await Promise.all(
        TARGET_LANGUAGES.map((lang) => translateAndStore(report, lang))
      );
    } catch (translationError) {
      console.error('Translation failed:', translationError);
      return NextResponse.json({ 
        error: 'Translation failed', 
        details: translationError instanceof Error ? translationError.message : 'Unknown error' 
      }, { status: 500 });
    }

    // Update the main report status
    await prisma.report.update({
      where: { id: id },
      data: { status: 'PUBLISHED' },
    });

    return NextResponse.json({ success: true, message: 'Report published in all languages.' });
  } catch (error) {
    console.error(`Failed to publish report ${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

