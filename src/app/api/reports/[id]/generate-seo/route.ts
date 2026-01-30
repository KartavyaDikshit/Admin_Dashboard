import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { openai, calculateCost } from '@/lib/openai';
import { getMarketYears } from '@/lib/utils';
import OpenAI from 'openai';
import { z } from 'zod';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const seoGenerationSchema = z.object({
  reportId: z.string().uuid(),
});

export async function POST(request: NextRequest, context: RouteContext) {
  const { id: reportId } = await context.params;

  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy-key') {
      return NextResponse.json({ error: 'OpenAI API Key not configured properly.' }, { status: 500 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: {
        title: true,
        description: true,
        summary: true,
        slug: true,
        imageUrl: true,
      },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const { currentYear, forecastPeriod, forecastEndYear } = getMarketYears();
    const baseYear = currentYear - 1;

    const prompt = `
      You are an expert in SEO and content strategy for market research reports.
      Generate comprehensive SEO metadata for a report with the following details:

      Report Title: "${report.title}"
      ${report.description ? `Report Description: "${report.description}"` : 'Report Description: (Not provided, generate based on title)'}
      ${report.summary ? `Report Summary: "${report.summary}"` : ''}
      Base Slug: "${report.slug}"
      Current Year: ${currentYear}
      Base Domain: "https://www.brainyinsights.com"

      IMPORTANT: 
      1. Ensure all metadata is optimized for the year ${currentYear}. 
      2. If you include years in the meta title or description (e.g., "Market Analysis ${currentYear}"), use ${currentYear} or future forecast years (e.g., ${forecastPeriod}). 
      3. DO NOT use previous years like ${currentYear - 1} or ${currentYear - 2} unless referring to historical data.
      4. For any URLs generated (in Schema Markup), ALWAYS use "https://www.brainyinsights.com" as the domain. Do NOT use "yourdomain.com" or "example.com".

      CRITICAL: Generate the metaDescription strictly using this format:
      "The {title} was valued at USD XX [Billion/Million] in ${baseYear}. The market is projected to reach USD XX [Billion/Million] by ${forecastEndYear}, growing at a CAGR of XX% during the ${forecastPeriod} period."
      
      Replace "XX" with realistic estimates based on the market type (e.g., if it's a niche market use Million, if large use Billion).
      - Ensure the values are plausible.
      - DO NOT use placeholders like "XX" in the final output.
      - DO NOT add extra fluff to the start or end of this sentence.

      Please provide the output as a JSON object with the following keys. Ensure all fields are optimized for SEO and target relevant market research keywords.
      - metaTitle (String, max ~60 characters, based on title, including high-value keywords)
      - metaDescription (String, max ~160 characters, strictly following the format above)
      - keywords (Array of Strings, list of primary and secondary keywords relevant to this market report)
      - semanticKeywords (Array of Strings, LSI keywords and related terms)
      - ogTitle (String, for Open Graph, similar to metaTitle)
      - ogDescription (String, for Open Graph, similar to metaDescription)
      - twitterTitle (String, similar to ogTitle)
      - twitterDescription (String, similar to ogDescription)
      - schemaMarkup (JSON object for Report or Article schema, include title, description)
      - faqData (JSON object for FAQPage schema, generate 2-3 relevant questions and answers)

      Ensure all generated content is highly relevant and professional for a market research context.
      For JSON fields, provide valid JSON strings.
    `;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an SEO expert specializing in market research. Provide a JSON object with optimized SEO metadata and keywords.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1500,
      });

      const generatedContentString = completion.choices[0]?.message?.content;
      if (!generatedContentString) {
        throw new Error('OpenAI returned empty content for SEO generation.');
      }

      const generatedSeoData = JSON.parse(generatedContentString);

      // Handle OG Image logic - Force specific URL format as requested
      // User requested format: https://www.brainyinsights.com/upload/${slug}.jpg
      const ogImage = `https://www.brainyinsights.com/upload/${report.slug}.jpg`;

      // Update the report in the database
      // Note: We are deliberately NOT updating 'canonicalUrl' here. 
      // It should be generated dynamically on the frontend to ensure the correct locale is always used.
      // We also do NOT update breadcrumbData, relying on frontend dynamic generation.
      const updatedReport = await prisma.report.update({
        where: { id: reportId },
        data: {
          metaTitle: generatedSeoData.metaTitle,
          metaDescription: generatedSeoData.metaDescription,
          keywords: generatedSeoData.keywords || [],
          semanticKeywords: generatedSeoData.semanticKeywords || [],
          // canonicalUrl: DO NOT UPDATE - Leave dynamic
          ogTitle: generatedSeoData.ogTitle,
          ogDescription: generatedSeoData.ogDescription,
          ogImage: ogImage,
          twitterTitle: generatedSeoData.twitterTitle,
          twitterDescription: generatedSeoData.twitterDescription,
          schemaMarkup: generatedSeoData.schemaMarkup,
          // breadcrumbData: DO NOT UPDATE - Leave dynamic from frontend
          faqData: generatedSeoData.faqData,
        },
      });

      // Log API usage
      const usage = completion.usage;
      const promptTokens = usage?.prompt_tokens || 0;
      const completionTokens = usage?.completion_tokens || 0;
      const totalTokens = usage?.total_tokens || 0;
      const totalCost = calculateCost(promptTokens, completionTokens);
      const costPerToken = totalTokens > 0 ? totalCost / totalTokens : 0;

      await prisma.apiUsageLog.create({
        data: {
          serviceType: 'OPENAI_GENERATE_SEO',
          model: completion.model,
          inputTokens: promptTokens,
          outputTokens: completionTokens,
          totalTokens: totalTokens,
          costPerToken: costPerToken,
          totalCost: totalCost,
          success: true,
          responseTime: 0,
          requestData: { prompt },
          responseData: completion as any,
        },
      });

      return NextResponse.json(updatedReport, { status: 200 });
    } catch (openaiError) {
      console.error('Error generating SEO with OpenAI:', openaiError);
      // Log failed API usage
      await prisma.apiUsageLog.create({
        data: {
          serviceType: 'OPENAI_GENERATE_SEO',
          model: 'gpt-4o-mini',
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          costPerToken: 0,
          totalCost: 0,
          success: false,
          errorMessage: openaiError instanceof Error ? openaiError.message : 'Unknown OpenAI error',
          responseTime: 0,
          requestData: { prompt },
          responseData: openaiError instanceof Error ? { message: openaiError.message, stack: openaiError.stack } : { message: 'Unknown OpenAI error' },
        },
      });
      return NextResponse.json(
        { error: 'Failed to generate SEO content.', details: openaiError instanceof Error ? openaiError.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in generate-seo API:', error);
    return NextResponse.json(
      { error: 'Internal server error.', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
