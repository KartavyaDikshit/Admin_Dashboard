import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reportId, reportTitle, requestType, name, description, email, phone, company, sourceUrl } = body;

    if (!reportId || !requestType || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const customizationRequest = await prisma.customizationRequest.create({
      data: {
        reportId,
        reportTitle,
        requestType,
        name,
        description,
        email,
        phone,
        company,
        sourceUrl,
      },
    });

    return NextResponse.json(customizationRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating customization request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const requests = await prisma.customizationRequest.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching customization requests:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
