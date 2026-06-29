import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { generateSlug } from '@/lib/utils'
import '@/lib/json-bigint'


// ... existing code ...



const reportSchema = z.object({
  categoryIds: z.array(z.string()).optional(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  summary: z.string().optional(),
  pages: z.coerce.number().int().positive().optional(),
  publishedDate: z.string(),
  baseYear: z.coerce.number().int().optional(),
  forecastPeriod: z.string().optional(),
  tableOfContents: z.string().optional(),
  methodology: z.string().optional(),
  executiveSummary: z.string().optional(),
  reportType: z.string().optional(),
  researchMethod: z.string().optional(),
  metaTitle: z.string().min(5, 'Meta title must be at least 5 characters'),
  metaDescription: z.string().min(10, 'Meta description must be at least 10 characters'),
  singlePrice: z.coerce.number().positive().optional(),
  multiPrice: z.coerce.number().positive().optional(),
  corporatePrice: z.coerce.number().positive().optional(),
  enterprisePrice: z.coerce.number().positive().optional(),
  trendingKeywords: z.array(z.string()).optional(),
  longTailKeywords: z.array(z.string()).optional(),
  titleDescription: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'ACTIVE']),
  featured: z.boolean(),
  priority: z.coerce.number().int().optional()
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const countOnly = searchParams.get('countOnly')

    if (countOnly === 'true') {
      const count = await prisma.report.count();
      return NextResponse.json({ count });
    }

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '25')
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId')
    const status = searchParams.get('status')
    const featured = searchParams.get('featured')
    const aiGenerated = searchParams.get('aiGenerated')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const isExport = searchParams.get('export') === 'true'

    const skip = isExport ? undefined : (page - 1) * limit
    const take = isExport ? undefined : limit

    const locale = searchParams.get('locale')

    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { reportId: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (categoryId) where.categories = { some: { id: categoryId } }
    if (status) {
      const parsedStatus = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'ACTIVE']).safeParse(status);
      if (parsedStatus.success) {
        where.status = parsedStatus.data;
      }
      else {
        console.warn(`Invalid status query parameter: ${status}. Ignoring.`);
      }
    }
    if (featured !== null) where.featured = featured === 'true'
    if (aiGenerated !== null) where.aiGenerated = aiGenerated === 'true'

    if (startDate || endDate) {
      where.publishedDate = {};
      if (startDate) where.publishedDate.gte = new Date(startDate);
      if (endDate) where.publishedDate.lte = new Date(endDate);
    }

    const reports: any[] = await prisma.report.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        sku: true,
        reportId: true,
        slug: true,
        title: true,
        titleDescription: true,
        description: true,
        summary: true,
        pages: true,
        publishedDate: true,
        baseYear: true,
        forecastPeriod: true,
        tableOfContents: true,
        listOfFigures: true,
        methodology: true,
        keyFindings: true,
        executiveSummary: true,
        marketResearchSummary: true,
        marketDynamics: true,
        regionalInsights: true,
        keyMarketPlayers: true,
        recentStrategicDevelopments: true,
        imageUrl: true,
        imageAlt: true,
        keywords: true,
        trendingKeywords: true,
        longTailKeywords: true,
        canonicalUrl: true,
        ogTitle: true,
        ogDescription: true,
        ogImage: true,
        twitterTitle: true,
        twitterDescription: true,
        schemaMarkup: true,
        viewCount: true,
        downloadCount: true,
        enquiryCount: true,
        updatedAt: true,
        reportType: true,
        researchMethod: true,
        metaTitle: true,
        metaDescription: true,
        singlePrice: true,
        multiPrice: true,
        corporatePrice: true,
        enterprisePrice: true,
        status: true,
        featured: true,
        priority: true,
        createdAt: true,
        categories: {
          select: {
            id: true,
            name: true,
            shortcode: true,
            translations: true,
          }
        },
        translations: locale ? {
          where: { locale: locale },
          select: {
            title: true,
            titleDescription: true,
            description: true,
            summary: true,
            slug: true,
            tableOfContents: true,
            listOfFigures: true,
            methodology: true,
            keyFindings: true,
            executiveSummary: true,
            keywords: true,
            semanticKeywords: true,
            localizedKeywords: true,
            culturalKeywords: true,
            longTailKeywords: true,
            localCompetitorKeywords: true,
            metaTitle: true,
            metaDescription: true,
            canonicalUrl: true,
            ogTitle: true,
            ogDescription: true,
            ogImage: true,
            twitterTitle: true,
            twitterDescription: true,
            schemaMarkup: true,
            breadcrumbData: true,
            faqData: true,
            localBusinessSchema: true,
          }
        } : undefined,
        _count: {
          select: { reviews: true, orderItems: true, translations: true }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    })

interface CategoryTranslation {
  locale: string;
  title: string;
  // Add other properties of CategoryTranslation if needed
}

interface CategoryWithTranslations {
  id: string;
  name: string;
  shortcode: string;
  translations: CategoryTranslation[];
}

    const reportsWithTranslatedFields = reports.map(report => {
      const translated = report.translations && report.translations.length > 0 ? report.translations[0] : null;
      const processedReport = {
        ...report,
        title: translated?.title || report.title,
        titleDescription: translated?.titleDescription || report.titleDescription,
        description: translated?.description || report.description,
        summary: translated?.summary || report.summary,
        slug: translated?.slug || report.slug,
        tableOfContents: translated?.tableOfContents || report.tableOfContents,
        listOfFigures: translated?.listOfFigures || report.listOfFigures,
        methodology: translated?.methodology || report.methodology,
        keyFindings: translated?.keyFindings || report.keyFindings,
        executiveSummary: translated?.executiveSummary || report.executiveSummary,
        marketResearchSummary: translated?.marketResearchSummary || report.marketResearchSummary,
        marketDynamics: translated?.marketDynamics || report.marketDynamics,
        regionalInsights: translated?.regionalInsights || report.regionalInsights,
        keyMarketPlayers: translated?.keyMarketPlayers || report.keyMarketPlayers,
        recentStrategicDevelopments: translated?.recentStrategicDevelopments || report.recentStrategicDevelopments,
        imageUrl: report.imageUrl,
        imageAlt: report.imageAlt,
        keywords: translated?.keywords || report.keywords || [],
        semanticKeywords: translated?.semanticKeywords || report.semanticKeywords || [],
        localizedKeywords: translated?.localizedKeywords || report.localizedKeywords || [],
        culturalKeywords: translated?.culturalKeywords || report.culturalKeywords || [],
        longTailKeywords: translated?.longTailKeywords || report.longTailKeywords || [],
        trendingKeywords: report.trendingKeywords || [],
        localCompetitorKeywords: translated?.localCompetitorKeywords || report.localCompetitorKeywords || [],
        metaTitle: translated?.metaTitle || report.metaTitle,
        metaDescription: translated?.metaDescription || report.metaDescription,
        canonicalUrl: translated?.canonicalUrl || report.canonicalUrl,
        ogTitle: translated?.ogTitle || report.ogTitle,
        ogDescription: translated?.ogDescription || report.ogDescription,
        ogImage: translated?.ogImage || report.ogImage,
        twitterTitle: translated?.twitterTitle || report.twitterTitle,
        twitterDescription: translated?.twitterDescription || report.twitterDescription,
        schemaMarkup: translated?.schemaMarkup || report.schemaMarkup,
        breadcrumbData: translated?.breadcrumbData || report.breadcrumbData,
        faqData: translated?.faqData || report.faqData,
        localBusinessSchema: translated?.localBusinessSchema || report.localBusinessSchema,
        viewCount: report.viewCount,
        downloadCount: report.downloadCount,
        enquiryCount: report.enquiryCount,
        updatedAt: report.updatedAt,
        reportType: report.reportType,
        researchMethod: report.researchMethod,
        baseYear: report.baseYear,
        forecastPeriod: report.forecastPeriod,
      };

      // Apply category translations
      processedReport.categories = processedReport.categories.map((category: CategoryWithTranslations) => {
        const translatedCategory = {
          ...category,
          title: category.name, // Default to English title
        };
        const categoryTranslation = category.translations.find((t: CategoryTranslation) => t.locale === locale);
        if (categoryTranslation && categoryTranslation.title) {
          translatedCategory.title = categoryTranslation.title;
        }
        return translatedCategory;
      });

      return processedReport;
    });

    const total = await prisma.report.count({ where })

    return NextResponse.json({
      reports: reportsWithTranslatedFields,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get reports error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { categoryIds, ...rest } = reportSchema.parse(body)

    // Generate unique reportId and slug
    let isUnique = false;
    let reportId = '';
    let slug = '';
    let counter = 0;

    while (!isUnique && counter < 10) {
      const randomNum = Math.floor(10000 + Math.random() * 90000); // 5 digits
      reportId = `FM-${randomNum}`;
      slug = `${generateSlug(rest.title)}-${randomNum}`;

      const existing = await prisma.report.findFirst({
        where: { OR: [{ reportId }, { slug }] }
      });

      if (!existing) {
        isUnique = true;
      }
      counter++;
    }

    if (!isUnique) {
       return NextResponse.json({ error: 'Failed to generate unique report ID' }, { status: 500 });
    }

    const report = await prisma.report.create({
      data: {
        ...rest,
        slug,
        reportId,
        publishedDate: new Date(rest.publishedDate), // Convert string to Date
        categories: {
          connect: categoryIds?.map(id => ({ id }))
        }
      }
    })

    return NextResponse.json({
      success: true,
      report
    })

  } catch (error) {
    console.error('Create report error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.issues
      }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
