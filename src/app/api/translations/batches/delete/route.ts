import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { batchIds } = await request.json();

        if (!batchIds || !Array.isArray(batchIds) || batchIds.length === 0) {
            return NextResponse.json({ error: 'Batch IDs are required' }, { status: 400 });
        }

        // Delete associated jobs first due to foreign key constraints
        await prisma.translationJob.deleteMany({
            where: {
                batchId: {
                    in: batchIds,
                },
            },
        });

        // Then delete the batches
        const deleteResult = await prisma.translationBatch.deleteMany({
            where: {
                id: {
                    in: batchIds,
                },
            },
        });

        return NextResponse.json({ success: true, deletedCount: deleteResult.count });

    } catch (error) {
        console.error('Error deleting translation batches:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        revalidatePath('/admin/translations'); // Revalidate the translations page
    }
