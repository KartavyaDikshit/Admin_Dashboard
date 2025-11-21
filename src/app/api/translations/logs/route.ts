import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const skip = (page - 1) * limit;

    const where = {
      serviceType: {
        in: ['OPENAI_TRANSLATE', 'OPENAI_TRANSLATE_CATEGORY'],
      },
    };

    const [logs, total] = await prisma.$transaction([
      prisma.apiUsageLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.apiUsageLog.count({ where }),
    ]);

    const summary = await prisma.apiUsageLog.aggregate({
      where,
      _sum: {
        totalCost: true,
        totalTokens: true,
      },
      _count: {
        _all: true,
      },
    });

    const successCount = await prisma.apiUsageLog.count({ where: { ...where, success: true } });
    const successRate = total > 0 ? (successCount / total) * 100 : 0;

    return NextResponse.json({
      logs,
      summary: {
        totalLogs: summary._count._all,
        totalCost: summary._sum.totalCost ?? 0,
        totalTokens: summary._sum.totalTokens ?? 0,
        successRate: successRate,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get Translation Logs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
