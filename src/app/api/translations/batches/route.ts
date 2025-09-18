import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const translationBatches = await prisma.translationBatch.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      // You might want to add pagination or filtering here in the future
    })

    return NextResponse.json({ batches: translationBatches }, { status: 200 })
  } catch (error) {
    console.error('Error fetching translation batches:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
