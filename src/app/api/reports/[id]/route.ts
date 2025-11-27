import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { generateSlug } from '@/lib/utils';

const reportUpdateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').optional(),
  marketResearchSummary: z.string().nullable().optional(),
  marketDynamics: z.string().nullable().optional(),
  regionalInsights: z.string().nullable().optional(),
  keyMarketPlayers: z.string().nullable().optional(),
  tableOfContents: z.string().nullable().optional(),
  imageUrl: z.preprocess(
    (val) => (val === "" ? null : val),
    z.string().nullable().optional()
  ),
  categoryIds: z.array(z.string().uuid()).optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('Get report error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = reportUpdateSchema.parse(body);

    const { categoryIds, ...reportData } = validatedData;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dataToUpdate: any = { ...reportData };

    if (reportData.title) {
      const baseSlug = generateSlug(reportData.title);
      let newSlug = baseSlug;
      let counter = 1;

      // Ensure slug uniqueness
      while (await prisma.report.findFirst({ where: { slug: newSlug, id: { not: id } } })) {
        newSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      dataToUpdate.slug = newSlug;
    }

    if (categoryIds) {
      dataToUpdate.categories = {
        set: categoryIds.map((categoryId) => ({ id: categoryId })),
      };
    }

    const updatedReport = await prisma.report.update({
      where: { id: id },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error('Update report error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.report.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete report error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}