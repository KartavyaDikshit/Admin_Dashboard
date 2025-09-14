// lib/tokenOptimizer.ts 
import { estimateTokenCount } from '@/lib/openai'; 

export class TokenOptimizer { 
    // Strategy 1: Remove unnecessary words and politeness 
    static optimizePromptLength(prompt: string): string { 
        return prompt 
            // Remove common politeness words 
            .replace(/\b(please|kindly|thank you|thanks)\b/gi, '') 
            // Remove unnecessary articles where context is clear 
            .replace(/\b(the|a|an)\s+(?=(market|industry|sector|analysis))/gi, '') 
            // Remove redundant phrases 
            .replace(/\b(in order to|for the purpose of)\b/gi, 'to') 
            .replace(/\b(due to the fact that|owing to the fact that)\b/gi, 'because') 
            .replace(/\b(in spite of the fact that)\b/gi, 'although') 
            // Remove multiple spaces 
            .replace(/\s+/g, ' ')
            .trim(); 
    }

    // Strategy 2: Compress context from previous outputs 
    static compressContext(previousOutputs: string[], maxContextTokens = 1000): string { 
        if (previousOutputs.length === 0) return ''; 

        const combined = previousOutputs.join('\n\n'); 
        const estimatedTokens = estimateTokenCount(combined); 

        if (estimatedTokens <= maxContextTokens) { 
            return combined; 
        }

        // Extract key information: numbers, company names, market sizes 
        const keyInformation = combined 
            .split('\n') 
            .filter(line => 
                line.includes('USD') || 
                line.includes('billion') || 
                line.includes('CAGR') || 
                line.includes('%') || 
                line.includes('2024') || 
                line.includes('2025') || 
                line.includes('market share') 
            ) 
            .join(' '); 

        // If still too long, truncate to key sentences 
        const sentences = keyInformation.split('. '); 
        let compressed = ''; 
        let tokenCount = 0; 

        for (const sentence of sentences) { 
            const sentenceTokens = estimateTokenCount(sentence); 
            if (tokenCount + sentenceTokens <= maxContextTokens) { 
                compressed += sentence + '. '; 
                tokenCount += sentenceTokens; 
            } else { 
                break; 
            } 
        }

        return compressed.trim(); 
    }

    // Strategy 3: Optimize JSON structure 
    static optimizeJsonStructure(data: unknown): string { 
        return JSON.stringify(data, null, 0); // No indentation 
    }

    // Strategy 4: Template optimization 
    static optimizeTemplate(template: string, variables: Record<string, string>): string { 
        let optimized = template; 

        // Replace variables 
        Object.entries(variables).forEach(([key, value]) => { 
            optimized = optimized.replace(new RegExp(`{${key}}`, 'g'), value); 
        }); 

        // Apply length optimization 
        return this.optimizePromptLength(optimized); 
    }

    // Calculate token savings from optimizations 
    static calculateSavings(original: string, optimized: string): { 
        originalTokens: number; 
        optimizedTokens: number; 
        tokensSaved: number; 
        percentageSaved: number; 
    } { 
        const originalTokens = estimateTokenCount(original); 
        const optimizedTokens = estimateTokenCount(optimized); 
        const tokensSaved = originalTokens - optimizedTokens; 
        const percentageSaved = (tokensSaved / originalTokens) * 100; 

        return { 
            originalTokens, 
            optimizedTokens, 
            tokensSaved, 
            percentageSaved 
        }; 
    }

    // Batch optimization for multiple prompts 
    static optimizeBatch(prompts: string[]): string[] { 
        return prompts.map(prompt => this.optimizePromptLength(prompt)); 
    }
}
