import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { TranslationStatus } from '@prisma/client'

const translatedCategorySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  // slug will be generated from title, not directly editable
  status: z.nativeEnum(TranslationStatus).default(TranslationStatus.PENDING_REVIEW),
})

interface RouteContext {
  params: { id: string; locale: string };
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { params } = context;
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: categoryId, locale } = params
    const body = await request.json()
    const validatedData = translatedCategorySchema.parse(body)

    // Generate slug from the translated title


    const updatedTranslation = await prisma.categoryTranslation.update({
      where: {
        categoryId_locale: {
          categoryId,
          locale,
        },
      },
      data: {
        ...validatedData,
        humanReviewed: true, // Mark as human-reviewed upon manual edit
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, translation: updatedTranslation }) 
  } catch (error: unknown) {
    console.error('Update category translation error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.issues,
      }, { status: 400 })
    }
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Internal server error', message: message }, { status: 500 })
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { params } = context;
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: categoryId, locale } = params

    const translation = await prisma.categoryTranslation.findUnique({
      where: {
        categoryId_locale: {
          categoryId,
          locale,
        },
      },
    })

    if (!translation) {
      return NextResponse.json({ error: 'Translation not found' }, { status: 404 })
    }

    return NextResponse.json({ translation })
  } catch (error: unknown) {
    console.error('Get category translation error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Internal server error', message: message }, { status: 500 })
  }
}
