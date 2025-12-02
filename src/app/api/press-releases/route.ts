import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { generateSlug } from '@/lib/utils';

const pressReleaseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  categoryIds: z.array(z.string()).optional(),
  published: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const pressReleases = await prisma.pressRelease.findMany({
      where,
      skip,
      take: limit,
      include: {
        categories: true,
        _count: { select: { translations: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.pressRelease.count({ where });

    return NextResponse.json({
      pressReleases,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get press releases error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { categoryIds, ...data } = pressReleaseSchema.parse(body);
    
    const slug = generateSlug(data.title);

    // Ensure slug uniqueness
    let uniqueSlug = slug;
    let counter = 1;
    while (await prisma.pressRelease.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    const pressRelease = await prisma.pressRelease.create({
      data: {
        ...data,
        slug: uniqueSlug,
        publishedAt: data.published ? new Date() : null,
        categories: categoryIds ? {
          connect: categoryIds.map(id => ({ id }))
        } : undefined
      },
    });

    return NextResponse.json(pressRelease);
  } catch (error) {
    console.error('Create press release error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
