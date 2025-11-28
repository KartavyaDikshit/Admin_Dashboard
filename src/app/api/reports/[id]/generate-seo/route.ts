import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { openai, calculateCost } from '@/lib/openai';
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
      },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const prompt = `
      You are an expert in SEO and content strategy for market research reports.
      Generate comprehensive SEO metadata for a report with the following details:

      Report Title: "${report.title}"
      ${report.description ? `Report Description: "${report.description}"` : 'Report Description: (Not provided, generate based on title)'}
      ${report.summary ? `Report Summary: "${report.summary}"` : ''}
      Base Slug: "${report.slug}" (for canonical URL)

      Please provide the output as a JSON object with the following keys. Ensure all fields are optimized for SEO and target relevant market research keywords.
      - metaTitle (String, max ~60 characters, based on title, including high-value keywords)
      - metaDescription (String, max ~160 characters, based on description/summary or title, compelling and keyword-rich)
      - keywords (Array of Strings, list of primary and secondary keywords relevant to this market report)
      - semanticKeywords (Array of Strings, LSI keywords and related terms)
      - canonicalUrl (String, derived from base slug, e.g., "https://yourdomain.com/reports/base-slug")
      - ogTitle (String, for Open Graph, similar to metaTitle)
      - ogDescription (String, for Open Graph, similar to metaDescription)
      - ogImage (String, a placeholder URL like "https://yourdomain.com/og-report-image.jpg")
      - twitterTitle (String, similar to ogTitle)
      - twitterDescription (String, similar to ogDescription)
      - schemaMarkup (JSON object for Report or Article schema, include title, description, and placeholder image)
      - breadcrumbData (JSON object for BreadcrumbList schema, include home, categories, and report)
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

      // Sanitize canonical URL to match expected format
      const canonicalUrl = `https://yourdomain.com/reports/${report.slug}`; // Assuming a fixed domain

      // Update the report in the database
      const updatedReport = await prisma.report.update({
        where: { id: reportId },
        data: {
          metaTitle: generatedSeoData.metaTitle,
          metaDescription: generatedSeoData.metaDescription,
          keywords: generatedSeoData.keywords || [],
          semanticKeywords: generatedSeoData.semanticKeywords || [],
          canonicalUrl: canonicalUrl,
          ogTitle: generatedSeoData.ogTitle,
          ogDescription: generatedSeoData.ogDescription,
          ogImage: generatedSeoData.ogImage,
          twitterTitle: generatedSeoData.twitterTitle,
          twitterDescription: generatedSeoData.twitterDescription,
          schemaMarkup: generatedSeoData.schemaMarkup,
          breadcrumbData: generatedSeoData.breadcrumbData,
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
