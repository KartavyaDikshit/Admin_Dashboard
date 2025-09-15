import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!testimonial) {
      return NextResponse.json({ message: 'Testimonial not found' }, { status: 404 });
    }

    return NextResponse.json(testimonial);
  } catch (error) {
    console.error(`Error fetching testimonial with ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Failed to fetch testimonial' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { author, company, position, content, rating, approved } = body;

    const updatedTestimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        author,
        company,
        position,
        content,
        rating: rating ? parseInt(rating, 10) : undefined,
        approved,
      },
    });

    return NextResponse.json(updatedTestimonial);
  } catch (error) {
    console.error(`Error updating testimonial with ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Failed to update testimonial' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await prisma.testimonial.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    console.error(`Error deleting testimonial with ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Failed to delete testimonial' }, { status: 500 });
  }
}
