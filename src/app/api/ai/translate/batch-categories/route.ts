import { NextRequest, NextResponse } from 'next/server'
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
  } catch (error: any) {
    console.error('Batch translate categories API error:', error)
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 })
  }
}
