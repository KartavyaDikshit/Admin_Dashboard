import { prisma } from '@/lib/prisma';
import { cache } from 'react';
import { Prisma, Report, Category, ReportTranslation, CategoryTranslation, PressRelease, PressReleaseTranslation, ContentStatus, TranslationStatus } from '@prisma/client'; // Import needed types

// Define custom types for relations
type ReportWithRelations = Report & {
  translations: ReportTranslation[];
  categories: CategoryWithRelations[]; // Categories are always included in this context, and mapCategory returns CategoryWithRelations
};

type CategoryWithRelations = Category & {
  translations: CategoryTranslation[];
};

type PressReleaseWithRelations = PressRelease & {
  translations: PressReleaseTranslation[];
};

// Helper to serialize Decimal and BigInt
const serializeDecimal = (value: Prisma.Decimal | null | undefined): number | null => {
  return value ? Number(value) : null;
};

const serializeBigInt = (value: bigint | null | undefined): number => {
  return value ? Number(value) : 0;
};

const mapCategory = (cat: CategoryWithRelations) => {
  const translation = cat.translations?.[0];
  return {
    ...cat,
    name: translation?.title || cat.name,
    description: translation?.description || cat.description,
    viewCount: serializeBigInt(cat.viewCount),
    clickCount: serializeBigInt(cat.clickCount),
    conversionRate: serializeDecimal(cat.conversionRate) || 0,
    translations: cat.translations.map(t => ({ // Map translations as well
      ...t,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }))
  };
};

const mapReport = (report: ReportWithRelations) => {
  const translation = report.translations?.[0];
  return {
    ...report,
    title: translation?.title || report.title,
    titleDescription: translation?.titleDescription || report.titleDescription,
    description: translation?.description || report.description,
    summary: translation?.summary || report.summary,
    tableOfContents: translation?.tableOfContents || report.tableOfContents,
    marketResearchSummary: translation?.marketResearchSummary || report.marketResearchSummary,
    marketDynamics: translation?.marketDynamics || report.marketDynamics,
    regionalInsights: translation?.regionalInsights || report.regionalInsights,
    keyMarketPlayers: translation?.keyMarketPlayers || report.keyMarketPlayers,
    
    // SEO Fields Mapping
    metaTitle: translation?.metaTitle || report.metaTitle,
    metaDescription: translation?.metaDescription || report.metaDescription,
    canonicalUrl: translation?.canonicalUrl || report.canonicalUrl,
    ogTitle: translation?.ogTitle || report.ogTitle,
    ogDescription: translation?.ogDescription || report.ogDescription,
    ogImage: translation?.ogImage || report.ogImage,
    twitterTitle: translation?.twitterTitle || report.twitterTitle,
    twitterDescription: translation?.twitterDescription || report.twitterDescription,
    keywords: (translation?.keywords?.length ?? 0) > 0 ? translation!.keywords : report.keywords,
    semanticKeywords: (translation?.semanticKeywords?.length ?? 0) > 0 ? translation!.semanticKeywords : report.semanticKeywords,
    schemaMarkup: translation?.schemaMarkup || report.schemaMarkup,
    breadcrumbData: translation?.breadcrumbData || report.breadcrumbData,
    faqData: translation?.faqData || report.faqData,

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
    regionalImpressions: serializeBigInt(translation?.regionalImpressions),
    regionalClicks: serializeBigInt(translation?.regionalClicks),
    
    // Translation Decimal fields
    regionalCtr: serializeDecimal(translation?.regionalCtr),
    translationQuality: serializeDecimal(translation?.translationQuality),
    culturalAdaptationScore: serializeDecimal(translation?.culturalAdaptationScore),

    translations: report.translations.map(t => ({ // Map translations as well
      ...t,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }))
  };
};

export const getCategories = cache(async (locale: string) => {
  try {
    const categories = await prisma.category.findMany({
      where: { status: ContentStatus.PUBLISHED }, // Use enum
      include: {
        translations: {
          where: { locale: locale },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return categories.map(cat => mapCategory(cat as CategoryWithRelations));
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

    return mapCategory(category as CategoryWithRelations);
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
});

export const getFeaturedCategories = cache(async (locale: string) => {
  try {
    const categories = await prisma.category.findMany({
      where: { 
        status: ContentStatus.PUBLISHED, // Use enum
        featured: true 
      },
      include: {
        translations: {
          where: { locale: locale },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return categories.map(cat => mapCategory(cat as CategoryWithRelations));
  } catch (error) {
    console.error('Error fetching featured categories:', error);
    return [];
  }
});

export const getFeaturedReports = cache(async (locale: string) => {
  try {
    const reports = await prisma.report.findMany({
      where: { 
        status: ContentStatus.PUBLISHED, // Use enum
        featured: true 
      },
      include: {
        translations: {
          where: { locale: locale },
        },
        categories: {
          include: {
            translations: { // Include translations for categories
              where: { locale: locale },
            }
          }
        },
      },
      orderBy: { publishedDate: 'desc' },
      take: 6,
    }) as ReportWithRelations[]; // Cast here

    return reports.map(report => {
      const mapped = mapReport(report);
      return {
        ...mapped,
        categories: report.categories.map(cat => mapCategory(cat as CategoryWithRelations))
      };
    });
  } catch (error) {
    console.error('Error fetching featured reports:', error);
    return [];
  }
});

export const getReports = cache(async (locale: string, categoryId?: string) => {
  try {
    const where: Prisma.ReportWhereInput = { status: ContentStatus.PUBLISHED }; // Use Prisma type and enum
    if (categoryId) {
      where.categories = { some: { id: categoryId } };
    }

    const reports = await prisma.report.findMany({
      where,
      include: {
        translations: {
          where: { locale: locale },
        },
        categories: {
          include: {
            translations: { // Include translations for categories
              where: { locale: locale },
            }
          }
        },
      },
      orderBy: { publishedDate: 'desc' },
      take: 10, // Limit for now
    }) as ReportWithRelations[]; // Cast here

    return reports.map(report => {
      const mapped = mapReport(report);
      return {
        ...mapped,
        categories: report.categories.map(cat => mapCategory(cat as CategoryWithRelations))
      };
    });
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
    
    const where: Prisma.ReportWhereInput = { status: ContentStatus.PUBLISHED }; // Use Prisma type and enum

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
      (prisma.report.findMany({
        where,
        include: {
          translations: {
            where: { locale: locale },
          },
          categories: {
            include: {
              translations: { // Include translations for categories
                where: { locale: locale },
              }
            }
          },
        },
        orderBy: { publishedDate: 'desc' },
        skip,
        take: limit,
      }) as unknown) as ReportWithRelations[], // Cast here to handle AcceleratePromise
    ]);

    const mappedReports = reports.map((report) => {
       const mapped = mapReport(report as ReportWithRelations); // Cast to ensure categories property is recognized
       return {
          ...mapped,
          categories: report.categories.map(cat => mapCategory(cat as CategoryWithRelations))
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
        categories: {
          include: {
            translations: { // Include translations for categories
              where: { locale: locale },
            }
          }
        },
      },
    }) as ReportWithRelations;

    if (!report) return null;

    const mapped = mapReport(report as ReportWithRelations);
    return {
       ...mapped,
       categories: report.categories.map(cat => mapCategory(cat as CategoryWithRelations))
    };
  } catch (error) {
    console.error('Error fetching report:', error);
    return null;
  }
});

export const getReportWithAllTranslations = cache(async (slug: string) => {
  try {
    const report = await prisma.report.findUnique({
      where: { slug },
      include: {
        translations: true,
      },
    });

    if (!report) {
      // Try finding by slug in translations
      const translation = await prisma.reportTranslation.findFirst({
        where: { slug },
        include: {
          report: {
            include: {
              translations: true
            }
          }
        }
      });
      return translation?.report || null;
    }

    return report;
  } catch (error) {
    console.error('Error fetching report with all translations:', error);
    return null;
  }
});

const mapPressRelease = (pr: PressReleaseWithRelations) => {
    const translation = pr.translations?.[0];
    return {
      ...pr,
      title: translation?.title || pr.title,
      description: translation?.description || pr.description,
      translations: pr.translations.map(t => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      }))
    };
  };
export const getPressReleases = cache(async (locale: string) => {
  try {
    const pressReleases = await prisma.pressRelease.findMany({
      where: { published: true }, // Assuming published is a boolean, not an enum. Schema confirms this.
      include: {
        translations: {
          where: { locale: locale },
        },
      },
      orderBy: { publishedAt: 'desc' },
    }) as PressReleaseWithRelations[];

    return pressReleases.map(pr => mapPressRelease(pr as PressReleaseWithRelations));
  } catch (error) {
    console.error('Error fetching press releases:', error);
    return [];
  }
});

export const getPressRelease = cache(async (slug: string, locale: string) => {
  try {
    // 1. Try exact match first (unlikely with the new URL format but good safety)
    let pressRelease = await prisma.pressRelease.findUnique({
      where: { slug },
      include: {
        translations: {
          where: { locale: locale },
        },
      },
    }) as PressReleaseWithRelations | null;

    // 2. If not found, handle the custom URL format: partial-slug+analysis
    if (!pressRelease) {
        // Remove +analysis or -analysis suffix
        const cleanSlug = slug.replace(/[-+]analysis$/i, '');
        
        if (cleanSlug !== slug) {
            // Strategy: The cleanSlug is "global-shoe" from "Global Shoe Market...".
            // The DB slug is likely "global-shoe-market-..."
            // So we look for a slug that STARTS with the cleanSlug.
            // We use findFirst.
            pressRelease = await prisma.pressRelease.findFirst({
                where: { 
                  slug: { 
                    startsWith: cleanSlug,
                    mode: 'insensitive' 
                  } 
                },
                include: {
                  translations: {
                    where: { locale: locale },
                  },
                },
            }) as PressReleaseWithRelations | null;
        }
    }

    if (!pressRelease) return null;

    return mapPressRelease(pressRelease as PressReleaseWithRelations);
  } catch (error) {
    console.error('Error fetching press release:', error);
    return null;
  }
});
