import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import { aiContentService } from '@/lib/services/aiService'
import { z } from 'zod'

const generateSchema = z.object({
  industry: z.string().min(1),
  marketSize: z.string().optional(),
  geographicScope: z.string().min(1),
  timeframe: z.string().min(1),
  reportType: z.string().min(1),
  customRequirements: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = generateSchema.parse(body)

    const workflow = await aiContentService.createWorkflow({
      ...validatedData,
      createdBy: session.user.id
    })

    return NextResponse.json({
      success: true,
      workflowId: workflow.id,
      status: workflow.workflowStatus
    })

  } catch (error) {
    console.error('AI Generation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}
