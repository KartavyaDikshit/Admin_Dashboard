import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { generateSlug } from '@/lib/utils'
import '@/lib/json-bigint'

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

    const skip = (page - 1) * limit
    
    interface ReportWhereClause {
      OR?: Array<{
        title?: { contains: string; mode: 'insensitive' };
        description?: { contains: string; mode: 'insensitive' };
        sku?: { contains: string; mode: 'insensitive' };
      }>;
      categories?: { some: { id: string } };
      status?: string;
      featured?: boolean;
      aiGenerated?: boolean;
    }
    const locale = searchParams.get('locale')

    const where: ReportWhereClause = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (categoryId) where.categories = { some: { id: categoryId } }
    if (status) where.status = status
    if (featured !== null) where.featured = featured === 'true'
    if (aiGenerated !== null) where.aiGenerated = aiGenerated === 'true'

    const reports = await prisma.report.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        sku: true,
        slug: true,
        title: true,
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
        categories: {
          select: {
            id: true,
            title_en: true,
            shortcode: true,
            translations: true,
          }
        },
        translations: locale ? {
          where: { locale: locale },
          select: {
            title: true,
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
          select: { reviews: true, orderItems: true }
        }
      },
      orderBy: [
        { featured: 'desc' },
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    const reportsWithTranslatedFields = reports.map(report => {
      const translated = report.translations && report.translations.length > 0 ? report.translations[0] : null;
      const processedReport = {
        ...report,
        title: translated?.title || report.title,
        description: translated?.description || report.description,
        summary: translated?.summary || report.summary,
        slug: translated?.slug || report.slug,
        tableOfContents: translated?.tableOfContents || report.tableOfContents,
        listOfFigures: translated?.listOfFigures || report.listOfFigures,
        methodology: translated?.methodology || report.methodology,
        keyFindings: translated?.keyFindings || report.keyFindings,
        executiveSummary: translated?.executiveSummary || report.executiveSummary,
        keywords: translated?.keywords || report.keywords,
        semanticKeywords: translated?.semanticKeywords || report.semanticKeywords,
        localizedKeywords: translated?.localizedKeywords || report.localizedKeywords,
        culturalKeywords: translated?.culturalKeywords || report.culturalKeywords,
        longTailKeywords: translated?.longTailKeywords || report.longTailKeywords,
        localCompetitorKeywords: translated?.localCompetitorKeywords || report.localCompetitorKeywords,
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
      };

      // Apply category translations
      processedReport.categories = processedReport.categories.map(category => {
        const translatedCategory = {
          ...category,
          title: category.title_en, // Default to English title
        };
        const categoryTranslation = category.translations.find(t => t.locale === locale);
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

    const slug = generateSlug(rest.title)

    const report = await prisma.report.create({
      data: {
        ...rest,
        slug,
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
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
