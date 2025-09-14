// app/api/ai/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { openai, MODEL_NAME, estimateTokenCount, calculateCost } from '@/lib/ai/openai';
import { TokenOptimizer } from '@/lib/ai/tokenOptimizer';
import { ContextManager } from '@/lib/ai/contextManager';
import { 
  PROMPT_CONFIGS, 
  GenerationRequest, 
  GenerationResponse, 
  TokenUsage,
  PromptResult 
} from '@/types/ai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Global context manager instance (in production, use Redis or database)
const globalContextManager = new ContextManager();
let sessionResults: PromptResult[] = [];

export async function POST(request: NextRequest) {
  try {
    const body: GenerationRequest = await request.json();
    const { promptId, reportTitle, context, useOptimizations = true } = body;

    // Get prompt configuration
    const promptConfig = PROMPT_CONFIGS[promptId];
    if (!promptConfig) {
      return NextResponse.json({
        success: false,
        error: `Invalid prompt ID: ${promptId}`
      });
    }

    // Prepare variables for template
    const variables: Record<string, string> = {
      title: reportTitle,
      context: context || globalContextManager.getCurrentContext()
    };

    // Generate optimized prompt
    let finalPrompt = promptConfig.template;
    if (useOptimizations) {
      finalPrompt = TokenOptimizer.optimizeTemplate(finalPrompt, variables);
    } else {
      // Replace variables without optimization
      Object.entries(variables).forEach(([key, value]) => {
        finalPrompt = finalPrompt.replace(new RegExp(`{${key}}`, 'g'), value);
      });
    }

    const startTime = Date.now();

    // Make OpenAI API call
    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        {
          role: 'system',
          content: 'You are an expert market research analyst. Provide accurate, data-driven insights with specific numbers and credible sources.'
        },
        {
          role: 'user', 
          content: finalPrompt
        }
      ],
      max_tokens: promptConfig.maxTokens,
      temperature: promptConfig.temperature,
    });

    const endTime = Date.now();
    const executionTime = endTime - startTime;

    // Extract response content
    const content = completion.choices[0]?.message?.content || '';

    // Calculate token usage
    const inputTokens = completion.usage?.prompt_tokens || estimateTokenCount(finalPrompt);
    const outputTokens = completion.usage?.completion_tokens || estimateTokenCount(content);
    const totalTokens = inputTokens + outputTokens;

    const tokenUsage: TokenUsage = {
      inputTokens,
      outputTokens, 
      totalTokens,
      cost: calculateCost(inputTokens, outputTokens)
    };

    // Create prompt result
    const result: PromptResult = {
      promptId,
      title: promptConfig.title,
      content,
      tokenUsage,
      timestamp: new Date(),
      executionTime
    };

    // Add to context manager for next prompts
    globalContextManager.addPromptResult(result);
    globalContextManager.implementSlidingWindow(2); // Keep last 2 outputs
    sessionResults.push(result);

    // Save to database
    await prisma.contentGenerationJob.create({
      data: {
        phase: parseInt(promptId.replace('prompt', '')),
        promptTemplate: promptConfig.template,
        aiModel: MODEL_NAME,
        temperature: promptConfig.temperature,
        maxTokens: promptConfig.maxTokens,
        inputPrompt: finalPrompt,
        outputText: content,
        inputTokens: inputTokens,
        outputTokens: outputTokens,
        totalTokens: totalTokens,
        cost: tokenUsage.cost,
        processingTime: executionTime,
        status: 'COMPLETED',
      }
    });


    const response: GenerationResponse = {
      success: true,
      data: {
        content,
        tokenUsage,
        executionTime
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}

// GET endpoint for retrieving session data
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  try {
    if (action === 'session') {
      // Return current session data
      const totalTokenUsage: TokenUsage = sessionResults.reduce(
        (total, result) => ({
          inputTokens: total.inputTokens + result.tokenUsage.inputTokens,
          outputTokens: total.outputTokens + result.tokenUsage.outputTokens,
          totalTokens: total.totalTokens + result.tokenUsage.totalTokens,
          cost: total.cost + result.tokenUsage.cost
        }),
        { inputTokens: 0, outputTokens: 0, totalTokens: 0, cost: 0 }
      );

      return NextResponse.json({
        success: true,
        data: {
          results: sessionResults,
          totalTokenUsage,
          contextWindow: globalContextManager.getContextWindow(),
          contextUsagePercentage: globalContextManager.getContextUsagePercentage()
        }
      });
    }

    if (action === 'reset') {
      // Reset session
      globalContextManager.clearContext();
      sessionResults = [];

      return NextResponse.json({
        success: true,
        data: { message: 'Session reset successfully' }
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action parameter'
    });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}

// PUT endpoint for regeneration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportTitle } = body;

    if (!reportTitle) {
      return NextResponse.json({
        success: false,
        error: 'Report title is required for regeneration'
      });
    }

    // Optimize context for regeneration using all previous results
    const optimizedContext = globalContextManager.optimizeForRegeneration(sessionResults);

    // Clear current context and set optimized context
    globalContextManager.clearContext();
    sessionResults = [];

    return NextResponse.json({
      success: true,
      data: {
        message: 'Context optimized for regeneration',
        optimizedContext,
        contextTokens: estimateTokenCount(optimizedContext)
      }
    });

  } catch (error) {
    console.error('Regeneration error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}