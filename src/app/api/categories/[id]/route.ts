import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { generateSlug } from '@/lib/utils';

const categoryUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(300, 'Name must be 300 characters or less'),
  description: z.string().nullable().optional(),
  shortcode: z.string().min(2).max(50),
  icon: z.string().max(500, 'Icon path must be 500 characters or less').nullable().optional(),
  featured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'ACTIVE']).default('PUBLISHED'),
  metaTitle: z.string().max(300, 'Meta title must be 300 characters or less').nullable().optional(),
  metaDescription: z.string().max(500, 'Meta description must be 500 characters or less').nullable().optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        translations: true,
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = categoryUpdateSchema.parse(body);

    const dataToUpdate = {
      ...validatedData,
      slug: generateSlug(validatedData.name).substring(0, 150),
    };

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Update category error:', error);
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
  const { id } = await context.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}