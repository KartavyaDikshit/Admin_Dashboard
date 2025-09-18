import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { generateSlug } from '@/lib/utils'

const categorySchema = z.object({
  shortcode: z.string().min(2).max(20),
  title_en: z.string().min(1),
  description_en: z.string().optional(),
  title_de: z.string().optional(),
  description_de: z.string().optional(),
  title_fr: z.string().optional(),
  description_fr: z.string().optional(),
  title_it: z.string().optional(),
  description_it: z.string().optional(),
  title_ja: z.string().optional(),
  description_ja: z.string().optional(),
  title_ko: z.string().optional(),
  description_ko: z.string().optional(),
  title_es: z.string().optional(),
  description_es: z.string().optional(),
  icon: z.string().optional(),
  featured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  seoKeywords: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'ACTIVE']).default('PUBLISHED')
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const category = await prisma.category.findUnique({
      where: { id: (await params).id },
      include: {
        _count: {
          select: { reports: true }
        },
        translations: true,
      }
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const locale = request.nextUrl.searchParams.get('locale') || 'en';

    const translatedCategory = {
      ...category,
      title: category[`title_${locale}` as keyof typeof category] || category.title_en,
      description: category[`description_${locale}` as keyof typeof category] || category.description_en,
      seoKeywords: category.seoKeywords,
      metaTitle: category.metaTitle,
      metaDescription: category.metaDescription,
    };

    // Override with CategoryTranslation if available
    const translation = category.translations.find(t => t.locale === locale);
    if (translation) {
      translatedCategory.title = translation.title || translatedCategory.title;
      translatedCategory.description = translation.description || translatedCategory.description;
      translatedCategory.seoKeywords = translation.seoKeywords || translatedCategory.seoKeywords;
      translatedCategory.metaTitle = translation.metaTitle || translatedCategory.metaTitle;
      translatedCategory.metaDescription = translation.metaDescription || translatedCategory.metaDescription;
    }

    // Remove the translations array from the final output
    delete translatedCategory.translations;

    return NextResponse.json({ category: translatedCategory })
  } catch (error) {
    console.error('Get category error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = categorySchema.parse(body)

    const { 
      title_en, description_en, shortcode, icon, featured, sortOrder, seoKeywords, metaTitle, metaDescription, status,
      title_de, description_de, seoKeywords_de, metaTitle_de, metaDescription_de,
      title_fr, description_fr, seoKeywords_fr, metaTitle_fr, metaDescription_fr,
      title_it, description_it, seoKeywords_it, metaTitle_it, metaDescription_it,
      title_ja, description_ja, seoKeywords_ja, metaTitle_ja, metaDescription_ja,
      title_ko, description_ko, seoKeywords_ko, metaTitle_ko, metaDescription_ko,
      title_es, description_es, seoKeywords_es, metaTitle_es, metaDescription_es,
    } = validatedData;

    const existingCategory = await prisma.category.findUnique({
      where: { id: (await params).id },
      select: { title_en: true }
    })

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const slug = (title_en !== existingCategory.title_en)
      ? generateSlug(title_en)
      : undefined

    const updatedCategory = await prisma.category.update({
      where: { id: (await params).id },
      data: {
        shortcode,
        title_en,
        description_en,
        icon,
        featured,
        sortOrder,
        seoKeywords,
        metaTitle,
        metaDescription,
        status,
        slug,
      }
    })

    const languages = ['de', 'fr', 'it', 'ja', 'ko', 'es'];

    for (const lang of languages) {
      const translationData: Record<string, any> = {};
      const hasTranslation = (
        validatedData[`title_${lang}` as keyof typeof validatedData] ||
        validatedData[`description_${lang}` as keyof typeof validatedData] ||
        validatedData[`seoKeywords_${lang}` as keyof typeof validatedData] ||
        validatedData[`metaTitle_${lang}` as keyof typeof validatedData] ||
        validatedData[`metaDescription_${lang}` as keyof typeof validatedData]
      );

      if (hasTranslation) {
        translationData.title = validatedData[`title_${lang}` as keyof typeof validatedData];
        translationData.description = validatedData[`description_${lang}` as keyof typeof validatedData];
        translationData.seoKeywords = validatedData[`seoKeywords_${lang}` as keyof typeof validatedData];
        translationData.metaTitle = validatedData[`metaTitle_${lang}` as keyof typeof validatedData];
        translationData.metaDescription = validatedData[`metaDescription_${lang}` as keyof typeof validatedData];

        await prisma.categoryTranslation.upsert({
          where: { categoryId_locale: { categoryId: updatedCategory.id, locale: lang } },
          update: translationData,
          create: {
            categoryId: updatedCategory.id,
            locale: lang,
            ...translationData,
          },
        });
      }
    }

    return NextResponse.json({ success: true, category: updatedCategory })
  } catch (error) {
    console.error('Update category error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.errors
      }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.category.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete category error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
