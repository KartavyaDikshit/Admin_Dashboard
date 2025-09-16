import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { workflowIds } = await request.json();

        if (!workflowIds || !Array.isArray(workflowIds) || workflowIds.length === 0) {
            return NextResponse.json({ error: 'Workflow IDs are required' }, { status: 400 });
        }

        // Delete associated jobs first due to foreign key constraints
        await prisma.contentGenerationJob.deleteMany({
            where: {
                workflowId: {
                    in: workflowIds,
                },
            },
        });

        // Then delete the workflows
        const deleteResult = await prisma.contentGenerationWorkflow.deleteMany({
            where: {
                id: {
                    in: workflowIds,
                },
            },
        });

        return NextResponse.json({ success: true, deletedCount: deleteResult.count });

    } catch (error) {
        console.error('Error deleting workflows:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
