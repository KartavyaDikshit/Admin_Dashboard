import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { generateSlug } from '@/lib/utils'

const reportSchema = z.object({
  categoryId: z.string().optional(),
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const report = await prisma.report.findUnique({
      where: { id: params.id },
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
      }
    })

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Get report error:', error)
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
    const validatedData = reportSchema.parse(body)

    const existingReport = await prisma.report.findUnique({
      where: { id: params.id },
      select: { title: true }
    })

    if (!existingReport) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    const slug = (validatedData.title !== existingReport.title)
      ? generateSlug(validatedData.title)
      : undefined

    const updatedReport = await prisma.report.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        slug,
        publishedDate: new Date(validatedData.publishedDate) // Convert string to Date
      }
    })

    return NextResponse.json({ success: true, report: updatedReport })
  } catch (error) {
    console.error('Update report error:', error)
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

    await prisma.report.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete report error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
