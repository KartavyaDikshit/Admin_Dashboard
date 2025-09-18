import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const categoryTranslationSchema = z.object({
  categoryId: z.string().uuid(),
  locale: z.string().min(2).max(5),
  title: z.string().optional(),
  description: z.string().optional(),
  seoKeywords: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = categoryTranslationSchema.parse(body);

    const { categoryId, locale, ...rest } = validatedData;

    const categoryTranslation = await prisma.categoryTranslation.upsert({
      where: { categoryId_locale: { categoryId, locale } },
      update: rest,
      create: {
        categoryId,
        locale,
        ...rest,
      },
    });

    return NextResponse.json({ success: true, categoryTranslation }, { status: 200 });
  } catch (error) {
    console.error('Error creating/updating category translation:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.errors,
      }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
