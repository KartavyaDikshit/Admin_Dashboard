import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    // In a real application, you might filter workflows by the logged-in user
    // For now, we fetch all workflows.

    const workflows = await prisma.contentGenerationWorkflow.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        jobs: {
          orderBy: { phase: 'asc' },
          select: {
            id: true,
            phase: true,
            status: true,
            outputText: true,
            imageUrl: true, // Include imageUrl
            inputTokens: true,
            outputTokens: true,
            cost: true,
            processingTime: true,
            errorMessage: true
          }
        }
      }
    });

    // Convert Decimal types to numbers for client-side consumption
    const workflowsWithNumbers = workflows.map(workflow => ({
      ...workflow,
      jobs: workflow.jobs.map(job => ({
        ...job,
        qualityScore: job.qualityScore ? job.qualityScore.toNumber() : null, // Still include if it exists in schema
        cost: job.cost ? job.cost.toNumber() : null,
      }))
    }));

    return NextResponse.json({ workflows: workflowsWithNumbers });
  } catch (error) {
    console.error('Error fetching all workflows:', error);
    return NextResponse.json({ error: 'Failed to fetch workflows.' }, { status: 500 });
  }
}
