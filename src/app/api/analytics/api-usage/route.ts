
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const logs = await prisma.apiUsageLog.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const summary = logs.reduce(
      (acc, log) => {
        acc.totalRequests += 1;
        acc.totalTokens += log.totalTokens;
        acc.totalCost += log.totalCost.toNumber();
        return acc;
      },
      { totalRequests: 0, totalTokens: 0, totalCost: 0 }
    );

    const timeSeries = logs.reduce((acc, log) => {
      const date = log.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, totalTokens: 0 };
      }
      acc[date].totalTokens += log.totalTokens;
      return acc;
    }, {} as Record<string, { date: string; totalTokens: number }>);

    const recentLogsFromDb = await prisma.apiUsageLog.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const recentLogs = recentLogsFromDb.map(log => ({
      ...log,
      totalCost: log.totalCost.toNumber(),
    }));

    return NextResponse.json({
      summary,
      timeSeries: Object.values(timeSeries),
      recentLogs,
    });
  } catch (error) {
    console.error('Failed to fetch API usage analytics:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
