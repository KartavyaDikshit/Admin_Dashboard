import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { aiContentService } from '@/lib/services/aiService';
import { ContentWorkflowStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find all child ContentGenerationWorkflows that are PENDING_REVIEW
    const pendingWorkflows = await prisma.contentGenerationWorkflow.findMany({
      where: {
        workflowStatus: ContentWorkflowStatus.PENDING_REVIEW,
        parentWorkflowId: { not: null }, // Ensure it's a child workflow
      },
    });

    let approvedCount = 0;
    for (const workflow of pendingWorkflows) {
      try {
        await aiContentService.approveWorkflow(workflow.id, session.user.id, undefined); // categoryIds not needed for child workflow
        approvedCount++;
      } catch (error) {
        console.error(`Error approving ContentGenerationWorkflow ${workflow.id}:`, error);
        // Continue to next workflow even if one fails
      }
    }

    revalidatePath('/admin/translations');
    return NextResponse.json({ success: true, approvedCount }, { status: 200 });
  } catch (error) {
    console.error('Approve all language workflows API error:', error);
    return NextResponse.json({ error: 'Internal server error', message: (error as Error).message }, { status: 500 });
  }
}
