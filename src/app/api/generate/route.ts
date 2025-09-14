// app/api/generate/route.ts
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
import prisma from '@/lib/prisma'; // Import Prisma Client

// In-memory context manager and session results are removed.
// Session management will now be handled by Prisma.

export async function POST(request: NextRequest) {
  try {
    const body: GenerationRequest = await request.json();
    const { promptId, reportTitle, context, useOptimizations = true, sessionId } = body;

    // Get prompt configuration
    const promptConfig = PROMPT_CONFIGS[promptId];
    if (!promptConfig) {
      return NextResponse.json({
        success: false,
        error: `Invalid prompt ID: ${promptId}`
      });
    }

    let currentSessionId = sessionId;
    let currentSession: any; // AiReportSession type from Prisma

    // If no sessionId is provided, create a new session
    if (!currentSessionId) {
      currentSession = await prisma.aiReportSession.create({
        data: {
          reportTitle,
          totalInputTokens: 0,
          totalOutputTokens: 0,
          totalCost: 0,
        },
      });
      currentSessionId = currentSession.id;
    } else {
      // Fetch existing session
      currentSession = await prisma.aiReportSession.findUnique({
        where: { id: currentSessionId },
        include: { promptResults: true },
      });

      if (!currentSession) {
        return NextResponse.json({
          success: false,
          error: `Session with ID ${currentSessionId} not found.`
        });
      }
    }

    // Re-initialize ContextManager with previous results from the database
    const contextManager = new ContextManager();
    if (currentSession.promptResults && currentSession.promptResults.length > 0) {
      currentSession.promptResults.forEach((pr: any) => contextManager.addPromptResult(pr));
      contextManager.implementSlidingWindow(2); // Apply sliding window to loaded context
    }

    // Prepare variables for template
    const variables: Record<string, string> = {
      title: reportTitle,
      context: context || contextManager.getCurrentContext()
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

    // Create prompt result record in the database
    const newPromptResult = await prisma.aiPromptResult.create({
      data: {
        sessionId: currentSessionId,
        promptId,
        title: promptConfig.title,
        content,
        inputTokens: tokenUsage.inputTokens,
        outputTokens: tokenUsage.outputTokens,
        totalTokens: tokenUsage.totalTokens,
        cost: tokenUsage.cost,
        executionTime,
      },
    });

    // Update the session's total token usage and cost
    await prisma.aiReportSession.update({
      where: { id: currentSessionId },
      data: {
        totalInputTokens: { increment: tokenUsage.inputTokens },
        totalOutputTokens: { increment: tokenUsage.outputTokens },
        totalCost: { increment: tokenUsage.cost },
      },
    });

    const response: GenerationResponse = {
      success: true,
      data: {
        content,
        tokenUsage,
        executionTime,
        sessionId: currentSessionId, // Return sessionId for subsequent requests
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

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  const sessionId = url.searchParams.get('sessionId'); // Get sessionId from query params

  try {
    if (action === 'session') {
      if (!sessionId) {
        return NextResponse.json({ success: false, error: 'Session ID is required for session action.' });
      }

      const session = await prisma.aiReportSession.findUnique({
        where: { id: sessionId },
        include: { promptResults: { orderBy: { createdAt: 'asc' } } },
      });

      if (!session) {
        return NextResponse.json({ success: false, error: 'Session not found.' });
      }

      // Re-initialize ContextManager to calculate context usage
      const contextManager = new ContextManager();
      session.promptResults.forEach(pr => contextManager.addPromptResult(pr));
      contextManager.implementSlidingWindow(2); // Apply sliding window to loaded context

      const totalTokenUsage: TokenUsage = {
        inputTokens: session.totalInputTokens,
        outputTokens: session.totalOutputTokens,
        totalTokens: session.totalInputTokens + session.totalOutputTokens, // Recalculate total
        cost: session.totalCost.toNumber(), // Convert Decimal to number
      };

      // Map Prisma results to PromptResult interface
      const results: PromptResult[] = session.promptResults.map(pr => ({
        promptId: pr.promptId,
        title: pr.title,
        content: pr.content,
        tokenUsage: {
          inputTokens: pr.inputTokens,
          outputTokens: pr.outputTokens,
          totalTokens: pr.totalTokens,
          cost: pr.cost.toNumber(),
        },
        timestamp: pr.createdAt,
        executionTime: pr.executionTime,
      }));

      return NextResponse.json({
        success: true,
        data: {
          results,
          totalTokenUsage,
          contextWindow: contextManager.getContextWindow(),
          contextUsagePercentage: contextManager.getContextUsagePercentage()
        }
      });
    }

    if (action === 'reset') {
      if (!sessionId) {
        return NextResponse.json({ success: false, error: 'Session ID is required for reset action.' });
      }
      // Delete the session and all its associated prompt results
      await prisma.aiReportSession.delete({
        where: { id: sessionId },
      });

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

export async function PUT(request: NextRequest) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  const sessionId = url.searchParams.get('sessionId'); // Get sessionId from query params

  try {
    if (action === 'regenerate') {
      const body = await request.json();
      const { reportTitle } = body;

      if (!reportTitle) {
        return NextResponse.json({
          success: false,
          error: 'Report title is required for regeneration'
        });
      }

      if (!sessionId) {
        return NextResponse.json({ success: false, error: 'Session ID is required for regeneration.' });
      }

      const session = await prisma.aiReportSession.findUnique({
        where: { id: sessionId },
        include: { promptResults: { orderBy: { createdAt: 'asc' } } },
      });

      if (!session) {
        return NextResponse.json({ success: false, error: 'Session not found for regeneration.' });
      }

      // Re-initialize ContextManager with all previous results from the database
      const contextManager = new ContextManager();
      session.promptResults.forEach(pr => contextManager.addPromptResult(pr));

      const optimizedContext = contextManager.optimizeForRegeneration(session.promptResults.map(pr => ({
        promptId: pr.promptId,
        title: pr.title,
        content: pr.content,
        tokenUsage: {
          inputTokens: pr.inputTokens,
          outputTokens: pr.outputTokens,
          totalTokens: pr.totalTokens,
          cost: pr.cost.toNumber(),
        },
        timestamp: pr.createdAt,
        executionTime: pr.executionTime,
      })));

      // Create a new session for the regenerated report
      const newSession = await prisma.aiReportSession.create({
        data: {
          reportTitle,
          totalInputTokens: 0,
          totalOutputTokens: 0,
          totalCost: 0,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          message: 'Context optimized for regeneration',
          optimizedContext,
          contextTokens: estimateTokenCount(optimizedContext),
          newSessionId: newSession.id, // Return new sessionId
        }
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action parameter for PUT request'
    });

  } catch (error) {
    console.error('Regeneration error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}