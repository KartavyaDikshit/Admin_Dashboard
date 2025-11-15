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

    const period = 30; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    console.log("AI Usage Details API: Fetching data from startDate:", startDate);

    const apiUsageLogs = await prisma.apiUsageLog.findMany({
      where: {
        createdAt: { gte: startDate },
        success: true, // Only consider successful requests
      },
      select: {
        serviceType: true,
        model: true,
        inputTokens: true,
        outputTokens: true,
        totalCost: true,
      },
    });

    console.log("AI Usage Details API: ApiUsageLogs fetched:", apiUsageLogs.length);

    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalCost = 0;
    const totalRequests = apiUsageLogs.length;

    const usageByType: { [key: string]: { totalInputTokens: number; totalOutputTokens: number; totalCost: number } } = {};
    const usageByModel: { [key: string]: { totalInputTokens: number; totalOutputTokens: number; totalCost: number } } = {};

    apiUsageLogs.forEach((log) => {
      const input = log.inputTokens || 0;
      const output = log.outputTokens || 0;
      const cost = log.totalCost?.toNumber() || 0; // totalCost is Decimal in schema

      totalInputTokens += input;
      totalOutputTokens += output;
      totalCost += cost;

      if (!usageByType[log.serviceType]) {
        usageByType[log.serviceType] = { totalInputTokens: 0, totalOutputTokens: 0, totalCost: 0 };
      }
      usageByType[log.serviceType].totalInputTokens += input;
      usageByType[log.serviceType].totalOutputTokens += output;
      usageByType[log.serviceType].totalCost += cost;

      if (!usageByModel[log.model]) {
        usageByModel[log.model] = { totalInputTokens: 0, totalOutputTokens: 0, totalCost: 0 };
      }
      usageByModel[log.model].totalInputTokens += input;
      usageByModel[log.model].totalOutputTokens += output;
      usageByModel[log.model].totalCost += cost;
    });

    console.log("AI Usage Details API: Aggregation complete.");

    const formattedUsageByType = Object.entries(usageByType).map(([type, data]) => ({
      type,
      ...data,
    }));

    const formattedUsageByModel = Object.entries(usageByModel).map(([model, data]) => ({
      model,
      ...data,
    }));

    return NextResponse.json({
      totalInputTokens,
      totalOutputTokens,
      totalCost,
      totalRequests,
      usageByType: formattedUsageByType,
      usageByModel: formattedUsageByModel,
    });
  } catch (error) {
    console.error('Error fetching AI usage details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
