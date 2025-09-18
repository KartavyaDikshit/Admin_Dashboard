import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { jobIds } = await request.json();

        if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
            return NextResponse.json({ error: 'Job IDs are required' }, { status: 400 });
        }

        const deleteResult = await prisma.translationJob.deleteMany({
            where: {
                id: {
                    in: jobIds,
                },
            },
        });

        return NextResponse.json({ success: true, deletedCount: deleteResult.count }, { status: 200 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Delete translation jobs error:', error);
        return NextResponse.json({ error: 'Internal server error', message: message }, { status: 500 });
    } finally {
        revalidatePath('/admin/translations'); // Revalidate the translations page
    }
}