import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prompts = await prisma.aiPromptTemplate.findMany({
        orderBy: { name: 'asc' }
    });
    return NextResponse.json({ prompts });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, templateText } = body;

    if (!id || templateText === undefined) {
         return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const prompt = await prisma.aiPromptTemplate.update({
        where: { id },
        data: { templateText }
    });
    return NextResponse.json(prompt);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
