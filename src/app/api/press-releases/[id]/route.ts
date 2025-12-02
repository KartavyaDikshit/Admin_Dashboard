import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { generateSlug } from '@/lib/utils';

const updateSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  categoryIds: z.array(z.string()).optional(),
  published: z.boolean().optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const pressRelease = await prisma.pressRelease.findUnique({
      where: { id },
      include: { categories: true, translations: true },
    });

    if (!pressRelease) {
      return NextResponse.json({ error: 'Press release not found' }, { status: 404 });
    }

    return NextResponse.json(pressRelease);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { categoryIds, ...data } = updateSchema.parse(body);

    const updateData: any = { ...data };
    if (data.title) {
        const slug = generateSlug(data.title);
         // Ensure slug uniqueness (simplified for update)
        let uniqueSlug = slug;
        let counter = 1;
        while (await prisma.pressRelease.findFirst({ where: { slug: uniqueSlug, id: { not: id } } })) {
            uniqueSlug = `${slug}-${counter}`;
            counter++;
        }
        updateData.slug = uniqueSlug;
    }

    if (data.published === true) {
        updateData.publishedAt = new Date();
    }

    if (categoryIds) {
      updateData.categories = {
        set: categoryIds.map(cid => ({ id: cid }))
      };
    }

    const pressRelease = await prisma.pressRelease.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(pressRelease);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await context.params;
    await prisma.pressRelease.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
