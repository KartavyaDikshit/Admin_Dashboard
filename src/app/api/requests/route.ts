import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, country, phone, company, designation, description, reportId, enquiryType, sourceUrl } = body;

    // Split fullName into firstName and lastName
    const nameParts = fullName ? fullName.trim().split(' ') : [''];
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    const enquiry = await prisma.enquiry.create({
      data: {
        firstName,
        lastName,
        email,
        country,
        phone,
        company,
        jobTitle: designation,
        message: description,
        enquiryType: enquiryType || 'Contact Form',
        reportId: reportId || undefined,
        status: 'NEW',
        source: sourceUrl,
      },
    });

    return NextResponse.json(enquiry, { status: 201 });
  } catch (error) {
    console.error('Error creating enquiry:', error);
    return NextResponse.json({ message: 'Failed to create enquiry' }, { status: 500 });
  }
}
