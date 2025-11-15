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

    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    const whereClause: { createdAt?: { gte?: Date; lte?: Date } } = {};

    if (startDateParam) {
      whereClause.createdAt = { ...whereClause.createdAt, gte: new Date(startDateParam) };
    }
    if (endDateParam) {
      whereClause.createdAt = { ...whereClause.createdAt, lte: new Date(endDateParam) };
    }

    const totalUsage = await prisma.apiUsageLog.aggregate({
      _sum: {
        inputTokens: true,
        outputTokens: true,
        totalTokens: true,
        totalCost: true, // Include totalCost in overall sum
      },
      where: whereClause,
    });

    const breakdownByServiceType = await prisma.apiUsageLog.groupBy({
      by: ['serviceType'],
      _sum: {
        inputTokens: true,
        outputTokens: true,
        totalTokens: true,
        totalCost: true, // Include totalCost in breakdown sum
      },
      where: whereClause,
      orderBy: {
        serviceType: 'asc',
      },
    });

    const responseData = {
      totalInputTokens: totalUsage._sum.inputTokens || 0,
      totalOutputTokens: totalUsage._sum.outputTokens || 0,
      totalTokens: totalUsage._sum.totalTokens || 0,
      totalCost: totalUsage._sum.totalCost?.toNumber() || 0, // Convert Decimal to Number
      breakdownByServiceType: breakdownByServiceType.map(item => ({
        serviceType: item.serviceType,
        inputTokens: item._sum.inputTokens || 0,
        outputTokens: item._sum.outputTokens || 0,
        totalTokens: item._sum.totalTokens || 0,
        totalCost: item._sum.totalCost?.toNumber() || 0, // Convert Decimal to Number
      })),
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching token usage analytics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
