import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const contentGenerationJobs = await prisma.contentGenerationJob.findMany({
      select: {
        id: true,
        type: true,
        model: true,
        inputTokens: true,
        outputTokens: true,
        cost: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const workflows = await prisma.workflow.findMany({
      select: {
        id: true,
        type: true,
        model: true,
        totalInputTokens: true,
        totalOutputTokens: true,
        totalCost: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const aiUsageLog = [
      ...contentGenerationJobs.map((job) => ({
        id: job.id,
        type: job.type,
        model: job.model,
        inputTokens: job.inputTokens,
        outputTokens: job.outputTokens,
        cost: job.cost,
        createdAt: job.createdAt,
        source: "ContentGenerationJob",
      })),
      ...workflows.map((workflow) => ({
        id: workflow.id,
        type: workflow.type,
        model: workflow.model,
        inputTokens: workflow.totalInputTokens,
        outputTokens: workflow.totalOutputTokens,
        cost: workflow.totalCost,
        createdAt: workflow.createdAt,
        source: "Workflow",
      })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return NextResponse.json(aiUsageLog);
  } catch (error) {
    console.error("Error fetching AI usage log:", error);
    return NextResponse.json(
      { error: "Failed to fetch AI usage log" },
      { status: 500 }
    );
  }
}
