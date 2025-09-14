import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Token estimation utility
export function estimateTokenCount(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters for English
  return Math.ceil(text.length / 4)
}

// Cost calculation based on GPT-4 pricing
export function calculateCost(inputTokens: number, outputTokens: number): number {
  const INPUT_COST_PER_1K = 0.03 // $0.03 per 1K tokens
  const OUTPUT_COST_PER_1K = 0.06 // $0.06 per 1K tokens
  
  return (inputTokens / 1000) * INPUT_COST_PER_1K + (outputTokens / 1000) * OUTPUT_COST_PER_1K
}

// Models configuration
export const AI_MODELS = {
  'gpt-4-turbo': {
    inputCost: 0.01,
    outputCost: 0.03,
    maxTokens: 128000
  },
  'gpt-4': {
    inputCost: 0.03,
    outputCost: 0.06,
    maxTokens: 8192
  },
  'gpt-3.5-turbo': {
    inputCost: 0.001,
    outputCost: 0.002,
    maxTokens: 4096
  }
}
