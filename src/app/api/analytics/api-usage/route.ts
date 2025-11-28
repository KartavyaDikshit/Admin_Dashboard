import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const skip = (page - 1) * limit;

    const [logs, total] = await prisma.$transaction([
      prisma.apiUsageLog.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.apiUsageLog.count(),
    ]);

    const summary = await prisma.apiUsageLog.aggregate({
      _sum: {
        totalCost: true,
        totalTokens: true,
      },
      _count: {
        _all: true,
      },
    });

    const successCount = await prisma.apiUsageLog.count({ where: { success: true } });
    const successRate = total > 0 ? (successCount / total) * 100 : 0;

    // Calculate time series data for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0); // Start of the day

    const timeSeriesRawData = await prisma.apiUsageLog.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _sum: {
        totalTokens: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Create a map for easier lookup and fill in missing dates
    const dailyDataMap = new Map<string, number>();
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(thirtyDaysAgo.getDate() + i);
      dailyDataMap.set(date.toISOString().split('T')[0], 0);
    }

    timeSeriesRawData.forEach((item: any) => {
      const dateKey = item.createdAt.toISOString().split('T')[0];
      dailyDataMap.set(dateKey, (dailyDataMap.get(dateKey) || 0) + (item._sum.totalTokens ?? 0));
    });

    const formattedTimeSeries = Array.from(dailyDataMap.entries()).map(([date, totalTokens]) => ({
      date,
      totalTokens,
    }));

    // Calculate token distribution by serviceType
    const tokenDistributionData = await prisma.apiUsageLog.groupBy({
      by: ['serviceType'],
      _sum: {
        totalTokens: true,
      },
      orderBy: {
        _sum: {
          totalTokens: 'desc',
        },
      },
    });

    const formattedTokenDistribution = tokenDistributionData.map((item: any) => ({
      name: item.serviceType,
      value: item._sum.totalTokens ?? 0,
    }));

    return NextResponse.json({
      logs,
      summary: {
        totalLogs: summary._count._all,
        totalCost: summary._sum.totalCost ?? 0,
        totalTokens: summary._sum.totalTokens ?? 0,
        successRate: successRate,
      },
      timeSeries: formattedTimeSeries,
      tokenDistribution: formattedTokenDistribution,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get API Usage Log error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
