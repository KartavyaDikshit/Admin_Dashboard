import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { generateSlug } from '@/lib/utils'
import { TranslationStatus } from '@prisma/client'

const translatedReportSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  summary: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  // slug will be generated from title, not directly editable
  status: z.nativeEnum(TranslationStatus).default(TranslationStatus.PENDING_REVIEW),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; locale: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: reportId, locale } = await params // Await params
    const body = await request.json()
    const validatedData = translatedReportSchema.parse(body)

    // Generate slug from the translated title
    const slug = generateSlug(validatedData.title);

    const updatedTranslation = await prisma.reportTranslation.update({
      where: {
        reportId_locale: {
          reportId,
          locale,
        },
      },
      data: {
        ...validatedData,
        slug,
        humanReviewed: true, // Mark as human-reviewed upon manual edit
        updatedAt: new Date(),
      },
    });

    // Also update the parent Report's updatedAt to trigger revalidation
    await prisma.report.update({
      where: { id: reportId },
      data: { updatedAt: new Date() },
    });

    revalidatePath('/admin/translations'); // Revalidate the translations page

    return NextResponse.json({ success: true, translation: updatedTranslation })
  } catch (error: any) {
    console.error('Update report translation error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.errors,
      }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; locale: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: reportId, locale } = await params // Await params

    const translation = await prisma.reportTranslation.findUnique({
      where: {
        reportId_locale: {
          reportId,
          locale,
        },
      },
    })

    if (!translation) {
      return NextResponse.json({ error: 'Translation not found' }, { status: 404 })
    }

    return NextResponse.json({ translation })
  } catch (error: any) {
    console.error('Get report translation error:', error)
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 })
  }
}
