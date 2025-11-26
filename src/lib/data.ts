import { prisma } from '@/lib/prisma';
import { cache } from 'react';

export const getCategories = cache(async (locale: string) => {
  try {
    const categories = await prisma.category.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        translations: {
          where: { locale: locale },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return categories.map((cat) => {
      const translation = cat.translations[0];
      return {
        ...cat,
        name: translation?.title || cat.name, // Fallback to base name
        description: translation?.description || cat.description,
      };
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
});

export const getCategory = cache(async (slug: string, locale: string) => {
  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        translations: {
          where: { locale: locale },
        },
      },
    });

    if (!category) return null;

    const translation = category.translations[0];
    return {
      ...category,
      name: translation?.title || category.name,
      description: translation?.description || category.description,
    };
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
});

export const getReports = cache(async (locale: string, categoryId?: string) => {
  try {
    const where: any = { status: 'PUBLISHED' };
    if (categoryId) {
      where.categories = { some: { id: categoryId } };
    }

    const reports = await prisma.report.findMany({
      where,
      include: {
        translations: {
          where: { locale: locale },
        },
        categories: true,
      },
      orderBy: { publishedDate: 'desc' },
      take: 10, // Limit for now
    });

    return reports.map((report) => {
      const translation = report.translations[0];
      return {
        ...report,
        title: translation?.title || report.title,
        description: translation?.description || report.description,
        summary: translation?.summary || report.summary,
        // Add other translated fields as needed
      };
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return [];
  }
});

export const getReport = cache(async (slug: string, locale: string) => {
  try {
    const report = await prisma.report.findUnique({
      where: { slug },
      include: {
        translations: {
          where: { locale: locale },
        },
        categories: true,
      },
    });

    if (!report) return null;

    const translation = report.translations[0];
    return {
      ...report,
      title: translation?.title || report.title,
      description: translation?.description || report.description,
      summary: translation?.summary || report.summary,
      tableOfContents: translation?.tableOfContents || report.tableOfContents,
      marketResearchSummary: translation?.marketResearchSummary || report.marketResearchSummary,
      marketDynamics: translation?.marketDynamics || report.marketDynamics,
      regionalInsights: translation?.regionalInsights || report.regionalInsights,
      keyMarketPlayers: translation?.keyMarketPlayers || report.keyMarketPlayers,
    };
  } catch (error) {
    console.error('Error fetching report:', error);
    return null;
  }
});
