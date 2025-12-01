import { prisma } from '@/lib/prisma';
import { cache } from 'react';

// Helper to serialize Decimal and BigInt
const serializeDecimal = (value: any): number | null => {
  return value ? Number(value) : null;
};

const serializeBigInt = (value: any): number => {
  return value ? Number(value) : 0;
};

const mapCategory = (cat: any) => {
  const translation = cat.translations?.[0];
  return {
    ...cat,
    name: translation?.title || cat.name,
    description: translation?.description || cat.description,
    viewCount: serializeBigInt(cat.viewCount),
    clickCount: serializeBigInt(cat.clickCount),
    conversionRate: serializeDecimal(cat.conversionRate) || 0,
  };
};

const mapReport = (report: any) => {
  const translation = report.translations?.[0];
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
    
    // Decimal fields
    singlePrice: serializeDecimal(report.singlePrice),
    multiPrice: serializeDecimal(report.multiPrice),
    corporatePrice: serializeDecimal(report.corporatePrice),
    enterprisePrice: serializeDecimal(report.enterprisePrice),
    clickThroughRate: serializeDecimal(report.clickThroughRate),
    averagePosition: serializeDecimal(report.averagePosition),
    bounceRate: serializeDecimal(report.bounceRate),
    avgRating: serializeDecimal(report.avgRating),

    // BigInt fields
    viewCount: serializeBigInt(report.viewCount),
    downloadCount: serializeBigInt(report.downloadCount),
    shareCount: serializeBigInt(report.shareCount),
    enquiryCount: serializeBigInt(report.enquiryCount),
    impressions: serializeBigInt(report.impressions),
    clicks: serializeBigInt(report.clicks),
    regionalImpressions: serializeBigInt(translation?.regionalImpressions || 0),
    regionalClicks: serializeBigInt(translation?.regionalClicks || 0),
    
    // Translation Decimal fields
    regionalCtr: serializeDecimal(translation?.regionalCtr),
    translationQuality: serializeDecimal(translation?.translationQuality),
    culturalAdaptationScore: serializeDecimal(translation?.culturalAdaptationScore),
  };
};

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

    return categories.map(mapCategory);
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

    return mapCategory(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
});

export const getFeaturedCategories = cache(async (locale: string) => {
  try {
    const categories = await prisma.category.findMany({
      where: { 
        status: 'PUBLISHED',
        featured: true 
      },
      include: {
        translations: {
          where: { locale: locale },
        },
      },
      orderBy: { sortOrder: 'asc' },
      take: 8,
    });

    return categories.map(mapCategory);
  } catch (error) {
    console.error('Error fetching featured categories:', error);
    return [];
  }
});

export const getFeaturedReports = cache(async (locale: string) => {
  try {
    const reports = await prisma.report.findMany({
      where: { 
        status: 'PUBLISHED',
        featured: true 
      },
      include: {
        translations: {
          where: { locale: locale },
        },
        categories: true,
      },
      orderBy: { publishedDate: 'desc' },
      take: 6,
    });

    return reports.map(mapReport);
  } catch (error) {
    console.error('Error fetching featured reports:', error);
    return [];
  }
});

export const getReports = cache(async (locale: string, categoryId?: string) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = { status: 'PUBLISHED' };
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

    return reports.map(mapReport);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return [];
  }
});

export const getPaginatedReports = cache(async (
  locale: string, 
  page: number = 1, 
  limit: number = 9, 
  search?: string, 
  categoryId?: string
) => {
  try {
    const skip = (page - 1) * limit;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = { status: 'PUBLISHED' };

    if (categoryId) {
      where.categories = { some: { id: categoryId } };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { translations: { some: { title: { contains: search, mode: 'insensitive' }, locale } } }
      ];
    }

    const [total, reports] = await Promise.all([
      prisma.report.count({ where }),
      prisma.report.findMany({
        where,
        include: {
          translations: {
            where: { locale: locale },
          },
          categories: true, // Keep categories relationship
        },
        orderBy: { publishedDate: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const mappedReports = reports.map((report) => {
       const mapped = mapReport(report);
       // Ensure categories are passed through mapReport or re-attached if mapReport strips them (it spreads ...report so it should keep them)
       // However, categories might have their own BigInts if they are full objects. 
       // In `include`, we got `categories: true`, so we have full Category objects inside.
       // We need to map those categories too!
       
       return {
          ...mapped,
          categories: report.categories.map(mapCategory)
       };
    });

    return {
      reports: mappedReports,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error('Error fetching paginated reports:', error);
    return { reports: [], total: 0, totalPages: 0, currentPage: 1 };
  }
});

export const getTestimonials = cache(async () => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { approved: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return testimonials.map(t => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching testimonials:', error);
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

    const mapped = mapReport(report);
    return {
       ...mapped,
       categories: report.categories.map(mapCategory)
    };
  } catch (error) {
    console.error('Error fetching report:', error);
    return null;
  }
});
