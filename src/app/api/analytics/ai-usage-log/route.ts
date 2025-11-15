import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const apiUsageLogs = await prisma.apiUsageLog.findMany({
      select: {
        id: true,
        serviceType: true,
        model: true,
        inputTokens: true,
        outputTokens: true,
        totalCost: true,
        createdAt: true,
        success: true,
        errorMessage: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedLogs = apiUsageLogs.map((log) => ({
      id: log.id,
      type: log.serviceType, // Map serviceType to type for consistency
      model: log.model,
      inputTokens: log.inputTokens,
      outputTokens: log.outputTokens,
      cost: log.totalCost,
      createdAt: log.createdAt,
      source: "ApiUsageLog",
      success: log.success,
      errorMessage: log.errorMessage,
    }));

    return NextResponse.json(formattedLogs);
  } catch (error) {
    console.error("Error fetching AI usage log:", error);
    return NextResponse.json(
      { error: "Failed to fetch AI usage log" },
      { status: 500 }
    );
  }
}