import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30';

    const days = parseInt(period, 10);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
        const translationUsage = await prisma.apiUsageLog.aggregate({
            where: {
                serviceType: 'TRANSLATION',
                createdAt: {
                    gte: startDate,
                },
            },
            _sum: {
                totalTokens: true,
                totalCost: true,
            },
            _count: {
                _all: true,
            },
        });

        return NextResponse.json({
            totalTokens: translationUsage._sum.totalTokens || 0,
            totalCost: translationUsage._sum.totalCost || 0,
            totalRequests: translationUsage._count._all || 0,
        });
    } catch (error) {
        console.error('Failed to fetch translation usage:', error);
        return NextResponse.json({ error: 'Failed to fetch translation usage' }, { status: 500 });
    }
}
