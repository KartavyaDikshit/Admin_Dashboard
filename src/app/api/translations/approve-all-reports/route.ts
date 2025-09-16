import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { TranslationStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find all ReportTranslations that are not yet PUBLISHED or APPROVED
    const pendingTranslations = await prisma.reportTranslation.findMany({
      where: {
        status: { in: [TranslationStatus.PENDING, TranslationStatus.PENDING_REVIEW, TranslationStatus.IN_REVIEW] },
      },
    });

    let approvedCount = 0;
    for (const translation of pendingTranslations) {
      try {
        await prisma.reportTranslation.update({
          where: { id: translation.id },
          data: {
            status: TranslationStatus.PUBLISHED,
            humanReviewed: true,
            updatedAt: new Date(),
          },
        });
        approvedCount++;
      } catch (error) {
        console.error(`Error approving ReportTranslation ${translation.id}:`, error);
        // Continue to next translation even if one fails
      }
    }

    revalidatePath('/admin/translations');
    return NextResponse.json({ success: true, approvedCount }, { status: 200 });
  } catch (error) {
    console.error('Approve all reports API error:', error);
    return NextResponse.json({ error: 'Internal server error', message: (error as Error).message }, { status: 500 });
  }
}