import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { generateSlug } from '@/lib/utils'
import '@/lib/json-bigint' // Import BigInt serialization utility

const categorySchema = z.object({
  shortcode: z.string().min(2).max(20),
  title: z.string().min(1),
  description: z.string().optional(),
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
    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { shortcode: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status) where.status = status
    if (featured !== null) where.featured = featured === 'true'

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        include: {
          translations: {
            select: {
              id: true,
              locale: true,
              title: true,
              status: true
            }
          },
          _count: {
            select: {
              reports: true
            }
          }
        },
        orderBy: [
          { featured: 'desc' },
          { sortOrder: 'asc' },
          { title: 'asc' }
        ]
      }),
      prisma.category.count({ where })
    ])

    return NextResponse.json({
      categories,
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

    const slug = generateSlug(validatedData.title)

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
