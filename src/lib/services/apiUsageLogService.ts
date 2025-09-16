import { prisma } from '@/lib/prisma';
import { MODEL_NAME } from '@/lib/openai';
import { MODEL_NAME } from '@/lib/openai';

const COST_PER_TOKEN: { [key: string]: number } = {
    'gpt-4o-mini': 0.00000015, // $0.15 / 1M tokens
};

export const getCostPerToken = async (model: string): Promise<number> => {
    const lastLog = await prisma.apiUsageLog.findFirst({
        where: {
            model: model,
            success: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    if (lastLog && lastLog.totalCost && lastLog.totalTokens) {
        return lastLog.totalCost.toNumber() / lastLog.totalTokens;
    }

    return COST_PER_TOKEN[model] || 0;
}