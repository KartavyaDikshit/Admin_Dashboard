import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { generateSlug } from '@/lib/utils'

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const category = await prisma.category.findUnique({
      where: { id: params.id },
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
          select: { reports: true }
        }
      }
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Get category error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = categorySchema.parse(body)

    const existingCategory = await prisma.category.findUnique({
      where: { id: params.id },
      select: { title: true }
    })

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const slug = (validatedData.title !== existingCategory.title)
      ? generateSlug(validatedData.title)
      : undefined

    const updatedCategory = await prisma.category.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        slug,
      }
    })

    return NextResponse.json({ success: true, category: updatedCategory })
  } catch (error) {
    console.error('Update category error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.errors
      }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.category.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete category error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
