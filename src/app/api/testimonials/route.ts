import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(testimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json({ message: 'Failed to fetch testimonials' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { author, company, position, content, rating, approved } = body;

    if (!author || !content) {
      return NextResponse.json({ message: 'Author and content are required' }, { status: 400 });
    }

    const newTestimonial = await prisma.testimonial.create({
      data: {
        author,
        company,
        position,
        content,
        rating: rating ? parseInt(rating, 10) : undefined,
        approved: approved || false,
      },
    });

    return NextResponse.json(newTestimonial, { status: 201 });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json({ message: 'Failed to create testimonial' }, { status: 500 });
  }
}
