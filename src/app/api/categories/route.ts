import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { generateSlug } from '@/lib/utils';
import '@/lib/json-bigint';

const categoryCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  shortcode: z.string().min(2).max(20),
  icon: z.string().optional(),
  featured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'ACTIVE']).default('PUBLISHED'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const countOnly = searchParams.get('countOnly');

    if (countOnly === 'true') {
      const count = await prisma.category.count();
      return NextResponse.json({ count });
    }

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const where: any = search 
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { shortcode: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const categories = await prisma.category.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: {
          select: {
            reports: true,
            translations: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    const total = await prisma.category.count({ where });

    return NextResponse.json({
      categories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get categories error:', error);
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
    const validatedData = categoryCreateSchema.parse(body);

    const slug = generateSlug(validatedData.name);

    const category = await prisma.category.create({
      data: {
        ...validatedData,
        slug,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}