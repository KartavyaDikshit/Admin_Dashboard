import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
      reports,
      categories,
      orders,
      testimonials,
      requests,
      users,
      totalApiRequests,
      apiUsageCostAggregate,
    ] = await Promise.all([
      prisma.report.count(),
      prisma.category.count(),
      prisma.order.count(),
      prisma.testimonial.count(),
      prisma.enquiry.count(),
      prisma.user.count(),
      prisma.apiUsageLog.count(),
      prisma.apiUsageLog.aggregate({
        _sum: {
          totalCost: true,
        },
      }),
    ]);

    return NextResponse.json({
      reports,
      categories,
      orders,
      testimonials,
      requests,
      users,
      totalApiRequests,
      totalApiCost: apiUsageCostAggregate._sum.totalCost?.toNumber() || 0,
    });
  } catch (error) {
    console.error('Error fetching admin dashboard counts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
