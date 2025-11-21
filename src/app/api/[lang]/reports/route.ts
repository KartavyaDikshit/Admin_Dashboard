import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  context: { params: { lang: string } }
) {
  const params = context.params;
  const { lang } = params;

  try {
    const reports = await prisma.report.findMany({
      include: {
        translations: {
          where: {
            locale: lang,
          },
        },
      },
    });

    const translatedReports = reports.map((report) => {
      const translation = report.translations[0];
      return {
        id: report.id,
        slug: report.slug,
        title: translation?.title || report.title,
        description: translation?.description || report.description,
        imageUrl: report.imageUrl,
        publishedDate: report.publishedDate.toISOString(),
        marketResearchSummary: translation?.marketResearchSummary || report.marketResearchSummary,
        marketDynamics: translation?.marketDynamics || report.marketDynamics,
        regionalInsights: translation?.regionalInsights || report.regionalInsights,
        keyMarketPlayers: translation?.keyMarketPlayers || report.keyMarketPlayers,
      };
    });

    return NextResponse.json(translatedReports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}