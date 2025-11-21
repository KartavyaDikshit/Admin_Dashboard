import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  context: { params: { lang: string; slug: string } }
) {
  const params = context.params;
  const { lang, slug } = params;

  try {
    const report = await prisma.report.findUnique({
      where: {
        slug,
      },
      include: {
        translations: {
          where: {
            locale: lang,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const translation = report.translations[0];

    const translatedReport = {
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
        tableOfContents: translation?.tableOfContents || report.tableOfContents,
    };

    return NextResponse.json(translatedReport);
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}