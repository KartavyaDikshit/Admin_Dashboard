
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [reports, categories, orders, testimonials, requests, users] = await Promise.all([
      prisma.report.count(),
      prisma.category.count(),
      prisma.order.count(),
      prisma.testimonial.count(),
      prisma.enquiry.count(),
      prisma.user.count(),
    ]);

    return NextResponse.json({
      reports,
      categories,
      orders,
      testimonials,
      requests,
      users,
    });
  } catch (error) {
    console.error('Failed to fetch dashboard counts:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
