import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { openai } from '@/lib/openai';

const generateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy-key') {
      return NextResponse.json({ error: 'OpenAI API Key not configured properly.' }, { status: 500 });
    }

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

    let response;
    const MAX_RETRIES = 3;
    let retries = 0;

    while (retries < MAX_RETRIES) {
      try {
        response = await openai.chat.completions.create({
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
        break; // Success, exit loop
      } catch (error) {
        retries++;
        console.error(`OpenAI API request failed (attempt ${retries}/${MAX_RETRIES}):`, error);
        if (retries >= MAX_RETRIES) throw error; // Rethrow if max retries reached
        // Wait for a short delay before retrying (exponential backoff: 1s, 2s, 3s)
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
    }

    const generatedContentString = response?.choices[0]?.message?.content;
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
