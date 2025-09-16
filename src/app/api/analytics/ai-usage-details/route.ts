import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const period = 30; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    console.log("AI Usage Details API: Fetching data from startDate:", startDate);

    const [contentGenerationJobs, workflows] = await Promise.all([
      prisma.contentGenerationJob.findMany({
        where: {
          createdAt: { gte: startDate },
          status: 'COMPLETED',
        },
        select: {
          aiModel: true,
          inputTokens: true,
          outputTokens: true,
          cost: true,
        },
      }),
      prisma.contentGenerationWorkflow.findMany({
        where: {
          createdAt: { gte: startDate },
          workflowStatus: 'APPROVED',
        },
        select: {
          totalInputTokensUsed: true,
          totalOutputTokensUsed: true,
          totalCost: true,
        },
      }),
    ]);

    console.log("AI Usage Details API: ContentGenerationJobs fetched:", contentGenerationJobs.length);
    console.log("AI Usage Details API: Workflows fetched:", workflows.length);

    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalCost = 0;
    let totalRequests = 0;

    const usageByType: { [key: string]: { totalInputTokens: number; totalOutputTokens: number; totalCost: number } } = {};
    const usageByModel: { [key: string]: { totalInputTokens: number; totalOutputTokens: number; totalCost: number } } = {};

    contentGenerationJobs.forEach((job) => {
      const input = job.inputTokens || 0;
      const output = job.outputTokens || 0;
      const cost = job.cost?.toNumber() || 0;
      const type = 'report'; // Infer type for ContentGenerationJob

      totalInputTokens += input;
      totalOutputTokens += output;
      totalCost += cost;
      totalRequests++;

      if (!usageByType[type]) {
        usageByType[type] = { totalInputTokens: 0, totalOutputTokens: 0, totalCost: 0 };
      }
      usageByType[type].totalInputTokens += input;
      usageByType[type].totalOutputTokens += output;
      usageByType[type].totalCost += cost;

      if (!usageByModel[job.aiModel]) {
        usageByModel[job.aiModel] = { totalInputTokens: 0, totalOutputTokens: 0, totalCost: 0 };
      }
      usageByModel[job.aiModel].totalInputTokens += input;
      usageByModel[job.aiModel].totalOutputTokens += output;
      usageByModel[job.aiModel].totalCost += cost;
    });

    workflows.forEach((workflow) => {
      const input = workflow.totalInputTokensUsed || 0;
      const output = workflow.totalOutputTokensUsed || 0;
      const cost = workflow.totalCost?.toNumber() || 0;
      const type = 'report'; // Infer type for ContentGenerationWorkflow
      const model = 'unknown'; // Placeholder for model in Workflow

      totalInputTokens += input;
      totalOutputTokens += output;
      totalCost += cost;
      totalRequests++;

      if (!usageByType[type]) {
        usageByType[type] = { totalInputTokens: 0, totalOutputTokens: 0, totalCost: 0 };
      }
      usageByType[type].totalInputTokens += input;
      usageByType[type].totalOutputTokens += output;
      usageByType[type].totalCost += cost;

      if (!usageByModel[model]) {
        usageByModel[model] = { totalInputTokens: 0, totalOutputTokens: 0, totalCost: 0 };
      }
      usageByModel[model].totalInputTokens += input;
      usageByModel[model].totalOutputTokens += output;
      usageByModel[model].totalCost += cost;
    });

    console.log("AI Usage Details API: Aggregation complete.");
    console.log("AI Usage Details API: totalInputTokens:", totalInputTokens);
    console.log("AI Usage Details API: totalOutputTokens:", totalOutputTokens);
    console.log("AI Usage Details API: totalCost:", totalCost);
    console.log("AI Usage Details API: totalRequests:", totalRequests);
    console.log("AI Usage Details API: usageByType:", usageByType);
    console.log("AI Usage Details API: usageByModel:", usageByModel);

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
