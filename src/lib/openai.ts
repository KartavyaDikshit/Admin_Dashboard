// lib/openai.ts 
import OpenAI from 'openai'; 

if (!process.env.OPENAI_API_KEY) { 
    throw new Error('OPENAI_API_KEY environment variable is required'); 
} 

export const openai = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY, 
}); 

export const MODEL_NAME = 'gpt-4o-mini'; 

// Token counting utility (approximate) 
export function estimateTokenCount(text: string): number { 
    // Rough approximation: 1 token ≈ 4 characters for English text 
    // GPT-4o mini uses the same tokenizer as GPT-4o 
    return Math.ceil(text.length / 4); 
} 

// Cost calculation utility 
export function calculateCost(inputTokens: number, outputTokens: number): number { 
    const INPUT_COST_PER_MILLION = 0.15; // $0.15 per 1M input tokens 
    const OUTPUT_COST_PER_MILLION = 0.60; // $0.60 per 1M output tokens 

    const inputCost = (inputTokens / 1_000_000) * INPUT_COST_PER_MILLION; 
    const outputCost = (outputTokens / 1_000_000) * OUTPUT_COST_PER_MILLION; 

    return inputCost + outputCost; 
}