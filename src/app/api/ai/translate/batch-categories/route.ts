import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { aiBatchTranslationService } from '@/lib/services/aiBatchTranslationService'

const BATCH_TARGET_LOCALES = ['de', 'fr', 'it', 'ja', 'ko', 'es'] // German, French, Italian, Japanese, Korean, Spanish

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const batch = await aiBatchTranslationService.createBatchTranslation(
      'CATEGORY',
      BATCH_TARGET_LOCALES,
      session.user.id
    )

    return NextResponse.json({ success: true, batch }, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Batch translate categories API error:', error)
    return NextResponse.json({ error: 'Internal server error', message: message }, { status: 500 })
  } finally {
    revalidatePath('/admin/translations') // Revalidate the translations page
  }
}