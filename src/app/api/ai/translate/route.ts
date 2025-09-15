import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { aiTranslationService } from '@/lib/services/aiTranslationService'
import { z } from 'zod'

const translationRequestSchema = z.object({
  contentType: z.enum(['REPORT', 'CATEGORY']),
  contentId: z.string().uuid(),
  targetLocale: z.string().min(2).max(5),
  sourceLocale: z.string().min(2).max(5).default('en'),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = translationRequestSchema.parse(body)

    const { contentType, contentId, targetLocale, sourceLocale } = validatedData

    const translationJob = await aiTranslationService.translateContent(
      contentType,
      contentId,
      targetLocale,
      sourceLocale
    )

    return NextResponse.json({ success: true, job: translationJob }, { status: 200 })
  } catch (error: any) {
    console.error('Translation API error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 })
  }
}
