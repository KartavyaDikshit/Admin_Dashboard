import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { generateSlug } from '@/lib/utils';

const reportUpdateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').optional(),
  titleDescription: z.string().nullable().optional(),
  marketResearchSummary: z.string().nullable().optional(),
  marketDynamics: z.string().nullable().optional(),
  regionalInsights: z.string().nullable().optional(),
  keyMarketPlayers: z.string().nullable().optional(),
  tableOfContents: z.string().nullable().optional(),
  imageUrl: z.preprocess(
    (val) => (val === "" ? null : val),
    z.string().nullable().optional()
  ),
  imageAlt: z.string().nullable().optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
  // SEO Fields
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  canonicalUrl: z.string().nullable().optional(),
  ogTitle: z.string().nullable().optional(),
  ogDescription: z.string().nullable().optional(),
  ogImage: z.string().nullable().optional(),
  twitterTitle: z.string().nullable().optional(),
  twitterDescription: z.string().nullable().optional(),
  schemaMarkup: z.any().nullable().optional(),
  breadcrumbData: z.any().nullable().optional(),
  faqData: z.any().nullable().optional(),
  // Price Fields
  singlePrice: z.coerce.number().nullable().optional(),
  multiPrice: z.coerce.number().nullable().optional(),
  corporatePrice: z.coerce.number().nullable().optional(),
  featured: z.boolean().optional(),
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

    const dataToUpdate: any = { ...reportData };

    if (reportData.title) {
      const currentReport = await prisma.report.findUnique({
        where: { id },
        select: { reportId: true }
      });

      let reportId = currentReport?.reportId;
      let numericPart = '';

      if (reportId) {
        numericPart = reportId.split('-')[1];
      } else {
        // Generate new if missing
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        numericPart = randomNum.toString();
        reportId = `FM-${numericPart}`;
        dataToUpdate.reportId = reportId;
      }

      const baseSlug = generateSlug(reportData.title);
      dataToUpdate.slug = `${baseSlug}-${numericPart}`;
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
  } catch (error: any) {
    console.error('Delete report error:', error);
    if (error.code === 'P2003') {
        return NextResponse.json(
            { error: 'Cannot delete this report because it has associated orders or other related data. Please archive it instead.' },
            { status: 400 }
        );
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}