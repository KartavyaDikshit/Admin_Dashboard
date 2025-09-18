import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { generateSlug } from '@/lib/utils'
import '@/lib/json-bigint' // Import BigInt serialization utility

const categorySchema = z.object({
  shortcode: z.string().min(2).max(20),
  title_en: z.string().min(1),
  description_en: z.string().optional(),
  title_de: z.string().optional(),
  description_de: z.string().optional(),
  title_fr: z.string().optional(),
  description_fr: z.string().optional(),
  title_it: z.string().optional(),
  description_it: z.string().optional(),
  title_ja: z.string().optional(),
  description_ja: z.string().optional(),
  title_ko: z.string().optional(),
  description_ko: z.string().optional(),
  title_es: z.string().optional(),
  description_es: z.string().optional(),
  icon: z.string().optional(),
  featured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  seoKeywords: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'ACTIVE']).default('PUBLISHED')
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const countOnly = searchParams.get('countOnly')

    if (countOnly === 'true') {
      const count = await prisma.category.count();
      return NextResponse.json({ count });
    }

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '25')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status')
    const featured = searchParams.get('featured')

    const skip = (page - 1) * limit
    
    interface CategoryWhereClause {
      OR?: Array<{
        title_en?: { contains: string; mode: 'insensitive' };
        shortcode?: { contains: string; mode: 'insensitive' };
        description_en?: { contains: string; mode: 'insensitive' };
      }>;
      status?: string;
      featured?: boolean;
    }
    const locale = searchParams.get('locale')

    const where: CategoryWhereClause = {}

    if (search) {
      where.OR = [
        { title_en: { contains: search, mode: 'insensitive' } },
        { shortcode: { contains: search, mode: 'insensitive' } },
        { description_en: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status) where.status = status
    if (featured !== null) where.featured = featured === 'true'

    const categories = await prisma.category.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        shortcode: true,
        slug: true,
        title_en: true,
        description_en: true,
        icon: true,
        featured: true,
        sortOrder: true,
        seoKeywords: true,
        metaTitle: true,
        metaDescription: true,
        status: true,
        _count: {
          select: {
            reports: true
          }
        },
        translations: locale ? {
          where: { locale: locale },
          select: {
            title: true,
            description: true,
            seoKeywords: true,
            metaTitle: true,
            metaDescription: true,
          }
        } : undefined,
      },
      orderBy: [
        { featured: 'desc' },
        { sortOrder: 'asc' },
        { title_en: 'asc' }
      ]
    })

    const categoriesWithTranslatedFields = categories.map(category => {
      const translated = category.translations && category.translations.length > 0 ? category.translations[0] : null;
      return {
        ...category,
        title: translated?.title || category[`title_${locale}` as keyof typeof category] || category.title_en,
        description: translated?.description || category[`description_${locale}` as keyof typeof category] || category.description_en,
        seoKeywords: translated?.seoKeywords || category.seoKeywords,
        metaTitle: translated?.metaTitle || category.metaTitle,
        metaDescription: translated?.metaDescription || category.metaDescription,
        translations: undefined, // Remove the translations array from the final output
      };
    });

    const total = await prisma.category.count({ where })

    return NextResponse.json({
      categories: categoriesWithTranslatedFields,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get categories error:', error)
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
    const validatedData = categorySchema.parse(body)

    const slug = generateSlug(validatedData.title_en)

    const category = await prisma.category.create({
      data: {
        ...validatedData,
        slug
      }
    })

    return NextResponse.json({
      success: true,
      category
    })

  } catch (error) {
    console.error('Create category error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
