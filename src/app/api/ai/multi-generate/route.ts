import { NextResponse } from 'next/server';
import { aiContentService } from '@/lib/services/aiService';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        // For now, using a hardcoded user ID. In a real application, this would come from the session.
        const userId = session?.user?.id || 'clsy03b0s0000108900000000'; 

        const { reportTitle } = await request.json();

        if (!reportTitle) {
            return NextResponse.json({ error: 'Report title is required.' }, { status: 400 });
        }

        const workflow = await aiContentService.createWorkflow(reportTitle, userId);

        return NextResponse.json({ workflowId: workflow.id });

    } catch (error) {
        console.error('Error in multi-generate API route:', error);
        return NextResponse.json({ error: 'Failed to start AI generation workflow.' }, { status: 500 });
    }
}
