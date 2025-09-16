import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { aiContentService } from '@/lib/services/aiService';
import { ContentWorkflowStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parentWorkflowId = params.id;

    // Find all child ContentGenerationWorkflows for this parent that are PENDING_REVIEW
    const pendingChildWorkflows = await prisma.contentGenerationWorkflow.findMany({
      where: {
        parentWorkflowId: parentWorkflowId,
        workflowStatus: ContentWorkflowStatus.PENDING_REVIEW,
      },
    });

    let approvedCount = 0;
    for (const workflow of pendingChildWorkflows) {
      try {
        await aiContentService.approveWorkflow(workflow.id, session.user.id, undefined); // categoryIds not needed for child workflow
        approvedCount++;
      } catch (error) {
        console.error(`Error approving child workflow ${workflow.id}:`, error);
        // Continue to next workflow even if one fails
      }
    }

    // Revalidate the parent workflow's page to show updated statuses
    revalidatePath(`/admin/ai-generation/${parentWorkflowId}`); // Assuming dynamic route for workflow details
    revalidatePath('/admin/ai-generation'); // Revalidate the main AI generation page

    return NextResponse.json({ success: true, approvedCount }, { status: 200 });
  } catch (error) {
    console.error('Approve all child workflows API error:', error);
    return NextResponse.json({ error: 'Internal server error', message: (error as Error).message }, { status: 500 });
  }
}
