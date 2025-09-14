// lib/contextManager.ts
import { ContextWindow, PromptResult } from '@/types/ai'; // Modified import path
import { TokenOptimizer } from '@/lib/ai/tokenOptimizer'; // Modified import path
import { estimateTokenCount } from '@/lib/ai/openai'; // Modified import path

export class ContextManager {
  private maxContextTokens: number;
  private contextWindow: ContextWindow;

  constructor(maxContextTokens: number = 2000) {
    this.maxContextTokens = maxContextTokens;
    this.contextWindow = {
      previousOutputs: [],
      compressedContext: '',
      totalContextTokens: 0,
      maxContextTokens
    };
  }

  // Add new prompt result to context
  addPromptResult(result: PromptResult): void {
    this.contextWindow.previousOutputs.push(result.content);
    this.updateCompressedContext();
  }

  // Get current context for next prompt
  getCurrentContext(): string {
    return this.contextWindow.compressedContext;
  }

  // Update compressed context using optimization strategies
  private updateCompressedContext(): void {
    const compressed = TokenOptimizer.compressContext(
      this.contextWindow.previousOutputs,
      this.maxContextTokens
    );

    this.contextWindow.compressedContext = compressed;
    this.contextWindow.totalContextTokens = estimateTokenCount(compressed);
  }

  // Implement sliding window - keep only last N outputs
  implementSlidingWindow(windowSize: number = 2): void {
    if (this.contextWindow.previousOutputs.length > windowSize) {
      this.contextWindow.previousOutputs = this.contextWindow.previousOutputs.slice(-windowSize);
      this.updateCompressedContext();
    }
  }

  // Clear context (for reset functionality)
  clearContext(): void {
    this.contextWindow = {
      previousOutputs: [],
      compressedContext: '',
      totalContextTokens: 0,
      maxContextTokens: this.maxContextTokens
    };
  }

  // Get context usage percentage
  getContextUsagePercentage(): number {
    return (this.contextWindow.totalContextTokens / this.maxContextTokens) * 100;
  }

  // Check if context window is full
  isContextWindowFull(): boolean {
    return this.contextWindow.totalContextTokens >= this.maxContextTokens;
  }

  // Get context window information
  getContextWindow(): ContextWindow {
    return { ...this.contextWindow };
  }

  // Optimize context for regeneration
  optimizeForRegeneration(allResults: PromptResult[]): string {
    // Extract key insights from all previous results
    const keyInsights = allResults.map(result => {
      const content = result.content;
      // Extract sentences with numbers, percentages, or key market data
      const sentences = content.split('. ');
      return sentences
        .filter(sentence => 
          sentence.includes('USD') ||
          sentence.includes('%') ||
          sentence.includes('billion') ||
          sentence.includes('market share') ||
          sentence.includes('CAGR')
        )
        .join('. ');
    }).join(' ');

    return TokenOptimizer.compressContext([keyInsights], this.maxContextTokens);
  }
}