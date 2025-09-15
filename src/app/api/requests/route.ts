import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Assuming prisma is correctly imported

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const countOnly = searchParams.get('countOnly');

    if (countOnly === 'true') {
      const count = await prisma.enquiry.count();
      return NextResponse.json({ count });
    }

    const enquiries = await prisma.enquiry.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(enquiries);
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    return NextResponse.json({ message: 'Failed to fetch enquiries' }, { status: 500 });
  }
}
