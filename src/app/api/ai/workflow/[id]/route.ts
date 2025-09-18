import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { aiContentService } from '@/lib/services/aiService'
import { ContentGenerationWorkflow, ContentGenerationJob } from '@prisma/client'; // Added import

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

    // Explicitly convert Decimal types to strings before sending response
    const processWorkflowForResponse = (wf: ContentGenerationWorkflow & { jobs: ContentGenerationJob[]; childWorkflows: ContentGenerationWorkflow[] }) => {
      return {
        ...wf,
        totalCost: wf.totalCost ? wf.totalCost.toString() : '0.0000',
        jobs: wf.jobs.map((job: ContentGenerationJob) => ({
          ...job,
          cost: job.cost ? job.cost.toString() : '0.0000',
        })),
      };
    };

    const responseWorkflow = processWorkflowForResponse(workflow);
    if (workflow.childWorkflows) {
      responseWorkflow.childWorkflows = workflow.childWorkflows.map(processWorkflowForResponse);
    }

    return NextResponse.json({ success: true, workflow: responseWorkflow });

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

    const { action, phase, categoryIds } = await request.json()

    if (action === 'regenerate' && typeof phase === 'number') {
      await aiContentService.regeneratePhase(params.id, phase)
      return NextResponse.json({ success: true })
    }

    if (action === 'approve') {
      const workflow = await aiContentService.getWorkflowStatus(params.id);

      if (!workflow) {
        return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
      }

      let categoryIdsToPass: string[] | undefined = categoryIds;

      if (!workflow.parentWorkflowId) { // This is a parent workflow
        if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
          return NextResponse.json({ error: 'categoryIds are required for parent workflow approval' }, { status: 400 });
        }
      } else { // This is a child workflow (translation)
        categoryIdsToPass = undefined; // categoryIds are not needed for child workflow approval
      }

      await aiContentService.approveWorkflow(params.id, session.user.id, categoryIdsToPass);
      return NextResponse.json({ success: true });
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