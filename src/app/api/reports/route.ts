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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '25')
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId')
    const status = searchParams.get('status')
    const featured = searchParams.get('featured')
    const aiGenerated = searchParams.get('aiGenerated')

    const skip = (page - 1) * limit
    const where: any = {}

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

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: limit,
        include: {
          categories: {
            select: {
              id: true,
              title: true,
              shortcode: true
            }
          },
          translations: {
            select: {
              id: true,
              locale: true,
              title: true,
              status: true
            }
          },
          _count: {
            select: { reviews: true, orderItems: true }
          }
        },
        orderBy: [
          { featured: 'desc' },
          { priority: 'desc' },
          { createdAt: 'desc' }
        ]
      }),
      prisma.report.count({ where })
    ])

    return NextResponse.json({
      reports,
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
