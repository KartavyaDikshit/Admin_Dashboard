import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const TARGET_LANGUAGES = ['de', 'fr', 'it', 'ja', 'ko', 'es']; // Exclude 'en' as it's the source

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categories = await prisma.category.findMany();

    if (categories.length === 0) {
      return NextResponse.json({ message: 'No categories to translate.' }, { status: 200 });
    }

    let translatedCount = 0;

    for (const category of categories) {
      for (const lang of TARGET_LANGUAGES) {
        const prompt = `Translate the following English category information into ${lang.toUpperCase()}:
        Title: ${category.title_en}
        Description: ${category.description_en}
        SEO Keywords: ${category.seoKeywords.join(', ')}
        Meta Title: ${category.metaTitle}
        Meta Description: ${category.metaDescription}

        Provide the output in a JSON format with keys: title, description, seoKeywords (array), metaTitle, metaDescription.`;

        try {
          const chatCompletion = await openai.chat.completions.create({
            model: "gpt-4o", // Or another suitable model
            messages: [{
              role: "user",
              content: prompt
            }],
            response_format: { type: "json_object" },
          });

          const translatedContent = JSON.parse(chatCompletion.choices[0].message.content || '{}');

          // Update category with translated fields
          await prisma.category.update({
            where: { id: category.id },
            data: {
              [`title_${lang}`]: translatedContent.title,
              [`description_${lang}`]: translatedContent.description,
            },
          });

          // Create or update CategoryTranslation entry
          await prisma.categoryTranslation.upsert({
            where: { categoryId_locale: { categoryId: category.id, locale: lang } },
            update: {
              title: translatedContent.title,
              description: translatedContent.description,
              seoKeywords: Array.isArray(translatedContent.seoKeywords) ? translatedContent.seoKeywords : [],
              metaTitle: translatedContent.metaTitle,
              metaDescription: translatedContent.metaDescription,
            },
            create: {
              categoryId: category.id,
              locale: lang,
              title: translatedContent.title,
              description: translatedContent.description,
              seoKeywords: Array.isArray(translatedContent.seoKeywords) ? translatedContent.seoKeywords : [],
              metaTitle: translatedContent.metaTitle,
              metaDescription: translatedContent.metaDescription,
            },
          });
          translatedCount++;
        } catch (openaiError) {
          console.error(`Error translating category ${category.id} to ${lang}:`, openaiError);
          // Continue to next translation even if one fails
        }
      }
    }

    return NextResponse.json({ message: `Successfully translated ${translatedCount} fields across categories.`, translatedCount }, { status: 200 });
  } catch (error) {
    console.error('Error in translate-all categories API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
