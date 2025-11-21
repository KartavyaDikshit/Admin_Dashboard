import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  context: { params: { lang: string; slug: string } }
) {
  const params = context.params;
  const { lang, slug } = params;

  try {
    const category = await prisma.category.findUnique({
      where: {
        slug,
      },
      include: {
        translations: {
          where: {
            locale: lang,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const translation = category.translations[0];

    const translatedCategory = {
      id: category.id,
      shortcode: category.shortcode,
      slug: category.slug,
      name: translation?.title || category.name,
      description: translation?.description || category.description,
      icon: category.icon,
      featured: category.featured,
      sortOrder: category.sortOrder,
    };

    return NextResponse.json(translatedCategory);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}