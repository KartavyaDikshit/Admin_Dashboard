import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import OpenAI from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = generateSchema.parse(body);

    const prompt = `
      Given the category name "${name}" ${description ? `and description "${description}"` : ''}, 
      generate the following details for a market research report website category.
      Return a valid JSON object with the following keys:
      - "shortcode": A unique, URL-friendly shortcode, max 20 chars (e.g., 'BIOCHEM_24').
      - "description": A concise, SEO-friendly description of the category (around 20-30 words). If a description was provided, refine and optimize it for SEO.
      - "metaTitle": A compelling meta title for SEO (around 50-60 characters).
      - "metaDescription": A compelling meta description for SEO (around 150-160 characters).
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in SEO and market research content strategy. Your output must be a single, valid JSON object.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5,
    });

    const generatedContentString = response.choices[0]?.message?.content;
    if (!generatedContentString) {
      throw new Error('OpenAI returned empty content.');
    }

    const generatedDetails = JSON.parse(generatedContentString);

    return NextResponse.json(generatedDetails);

  } catch (error) {
    console.error('Generate category details error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
