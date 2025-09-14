import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { aiContentService } from '@/lib/services/aiService'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workflow = await aiContentService.getWorkflowStatus(params.id)
    
    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    return NextResponse.json({ workflow })

  } catch (error) {
    console.error('Get workflow error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, phase } = await request.json()

    if (action === 'regenerate' && typeof phase === 'number') {
      await aiContentService.regeneratePhase(params.id, phase)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Workflow action error:', error)
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

    const { jobId, outputText } = await request.json()

    if (!jobId || outputText === undefined) {
      return NextResponse.json({ error: 'Job ID and outputText are required.' }, { status: 400 })
    }

    await aiContentService.updateJobOutput(jobId, outputText)
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Update job output error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}