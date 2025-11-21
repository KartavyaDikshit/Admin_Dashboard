import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: { id: string };
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { params } = context;
  try {
    const job = await prisma.translationJob.findUnique({
      where: { id: params.id },
    });

    if (!job) {
      return NextResponse.json({ error: 'Translation job not found' }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error(`Get translation job ${params.id} error:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
