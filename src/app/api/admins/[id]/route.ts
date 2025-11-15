import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcrypt';
import { Prisma } from '@prisma/client';

interface RouteContext {
  params: { id: string };
}

export async function GET(req: NextRequest, context: RouteContext) {
  const { params } = context;
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: params.id },
    });

    if (!admin) {
      return new NextResponse('Admin not found', { status: 404 });
    }

    return NextResponse.json(admin);
  } catch (error) {
    console.error('Failed to fetch admin:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const { params } = context;
  try {
    const body = await req.json();
    const { email, username, password, role } = body;

    const data: Prisma.AdminUpdateInput = { email, username, role };

    if (password) {
      data.password = await hash(password, 10);
    }

    const updatedAdmin = await prisma.admin.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(updatedAdmin);
  } catch (error) {
    console.error('Failed to update admin:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const { params } = context;
  try {
    await prisma.admin.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete admin:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
