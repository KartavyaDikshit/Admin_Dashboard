import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { generateSlug } from '@/lib/utils';

const finalizeReportSchema = z.object({
  sessionId: z.string().uuid(),
  reportTitle: z.string().min(3, 'Report title is required'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = finalizeReportSchema.parse(body);
    const { sessionId, reportTitle } = validatedData;

    // Fetch all prompt results for the given session
    const promptResults = await prisma.aiPromptResult.findMany({
      where: { sessionId: sessionId },
      orderBy: { createdAt: 'asc' },
    });

    if (promptResults.length === 0) {
      return NextResponse.json({ error: 'No AI prompt results found for this session.' }, { status: 404 });
    }

    let marketAnalysis = '';
    let competitiveAnalysis = ''; // Initialize competitiveAnalysis, will be populated if available
    let trendsAnalysis = '';
    let strategicDevelopments = '';
    let keyPlayers: string[] = [];
    let summary = '';

    for (const result of promptResults) {
      console.log(`Processing prompt: ${result.promptId}`);
      console.log(`Raw content from AiPromptResult: ${result.content}`);

      if (result.promptId === 'prompt1') {
        summary = result.content || ''; // Ensure summary is never undefined
      } else if (['prompt2', 'prompt3', 'prompt4'].includes(result.promptId)) {
        try {
          const parsedContent = JSON.parse(result.content);
          console.log(`Parsed content for ${result.promptId}:`, parsedContent);

          } else if (result.promptId === 'prompt2') {
            // Market Dynamics
            marketAnalysis = `Market Drivers:\n${parsedContent.marketDrivers || ''}\n\nMarket Restraints:\n${parsedContent.marketRestraints || ''}\n\nMarket Opportunities:\n${parsedContent.marketOpportunities || ''}`;
            // competitiveAnalysis is not directly from prompt2, so it will remain its initial empty string or be populated by other means
          } else if (result.promptId === 'prompt3') {
            // Regional Insights & Market Segmentation
            trendsAnalysis = `Regional Insights:\n${parsedContent.regionalInsights || ''}\n\nMarket Segmentation:\n${parsedContent.marketSegmentation || ''}`;
          } else if (result.promptId === 'prompt4') {
            // Key Market Players & Strategic Developments
            keyPlayers = Array.isArray(parsedContent.keyPlayers) ? parsedContent.keyPlayers : [];
            strategicDevelopments = parsedContent.strategicDevelopments || '';
          }
        } catch (parseError) {
          console.error(`Failed to parse JSON content for prompt ${result.promptId}:`, parseError);
          // Fallback to raw content if JSON parsing fails
          if (result.promptId === 'prompt2') {
            marketAnalysis = result.content || '';
          } else if (result.promptId === 'prompt3') {
            trendsAnalysis = result.content || '';
          } else if (result.promptId === 'prompt4') {
            strategicDevelopments = result.content || '';
            keyPlayers = []; // Ensure it's an empty array on parse failure
          }
        }
      }
    }

    // Create or update the Report entry
    const slug = generateSlug(reportTitle);
    const newReport = await prisma.report.create({
      data: {
        title: reportTitle,
        slug: slug,
        description: summary, // Using summary as initial description
        summary: summary,
        publishedDate: new Date(),
        metaTitle: `${reportTitle} | Market Research Report | TheBrainyInsights`,
        metaDescription: `Comprehensive market research report on ${reportTitle}. Key insights, trends, and competitive landscape.`,
        aiGenerated: true,
        status: 'DRAFT',
        marketAnalysis,
        competitiveAnalysis,
        trendsAnalysis,
        strategicDevelopments,
        keyPlayers,
      },
    });

    console.log('Final Report Data created:', {
      marketAnalysis,
      competitiveAnalysis,
      trendsAnalysis,
      strategicDevelopments,
      keyPlayers,
    });

    return NextResponse.json({ 
      success: true, 
      report: newReport, 
      processedData: {
        marketAnalysis,
        competitiveAnalysis,
        trendsAnalysis,
        strategicDevelopments,
        keyPlayers,
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Finalize AI report error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
