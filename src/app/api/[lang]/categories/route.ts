import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  context: { params: { lang: string } }
) {
  const params = context.params;
  const { lang } = params;

  try {
    const categories = await prisma.category.findMany({
      include: {
        translations: {
          where: {
            locale: lang,
          },
        },
      },
    });

    const translatedCategories = categories.map((category) => {
      const translation = category.translations[0];
      return {
        id: category.id,
        shortcode: category.shortcode,
        slug: category.slug,
        name: translation?.title || category.name,
        description: translation?.description || category.description,
        icon: category.icon,
        featured: category.featured,
        sortOrder: category.sortOrder,
      };
    });

    return NextResponse.json(translatedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}