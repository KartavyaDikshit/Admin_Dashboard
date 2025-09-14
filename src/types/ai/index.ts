// types/index.ts
export interface PromptConfig {
  id: string;
  title: string;
  description: string;
  template: string;
  maxTokens: number;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  temperature: number;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
}

export interface PromptResult {
  promptId: string;
  title: string;
  content: string;
  tokenUsage: TokenUsage;
  timestamp: Date;
  executionTime: number;
}

export interface ContextWindow {
  previousOutputs: string[];
  compressedContext: string;
  totalContextTokens: number;
  maxContextTokens: number;
}

export interface ReportSession {
  reportTitle: string;
  prompts: PromptResult[];
  totalTokenUsage: TokenUsage;
  contextWindow: ContextWindow;
  isComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OptimizationStrategy {
  name: string;
  description: string;
  tokenSavingsPercentage: number;
  enabled: boolean;
}

export interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
  tokenUsage?: TokenUsage;
}

export interface GenerationRequest {
  promptId: string;
  reportTitle: string;
  context?: string;
  useOptimizations?: boolean;
}

export interface GenerationResponse extends APIResponse {
  data?: {
    content: string;
    tokenUsage: TokenUsage;
    executionTime: number;
  };
}

export const PROMPT_CONFIGS: Record<string, PromptConfig> = {
  prompt1: {
    id: 'prompt1',
    title: 'Market Research Summary',
    description: 'Generate authoritative market research summary under 300 words',
    template: 'Generate authoritative market research summary on {title}. Focus on data-driven storytelling for C-level decision-makers. Under 300 words, paragraph format only. Structure: 1) Market opening with USD size 2025, forecasted 2034, CAGR 2) Market definition 3) Current momentum. Use clear, SEO-optimized language. Avoid filler phrases.',
    maxTokens: 400,
    estimatedInputTokens: 120,
    estimatedOutputTokens: 280,
    temperature: 0
  },
  prompt2: {
    id: 'prompt2',
    title: 'Market Dynamics',
    description: 'Generate Market Drivers, Restraints, and Opportunities',
    template: 'Create Market Dynamics section for {title}. Context: {context}. Structure: A) Market Drivers (2-4 key growth drivers with quantitative data) B) Market Restraints (1-3 barriers with examples) C) Market Opportunities (emerging growth areas). Analytical tone for executives. Paragraph format only, no bullet lists.',
    maxTokens: 500,
    estimatedInputTokens: 200,
    estimatedOutputTokens: 420,
    temperature: 0
  },
  prompt3: {
    id: 'prompt3',
    title: 'Regional Insights & Market Segmentation',
    description: 'Generate regional analysis and market segmentation',
    template: 'Create Regional Insights and Market Segmentation for {title}. Context: {context}. Part 1: Select largest market share region (North America/Asia-Pacific/Europe) with USD size, CAGR, key drivers. Part 2: Generate segmentation structure as bullet list. Part 3: Analyze top 2 primary segments with market share data and growth drivers.',
    maxTokens: 650,
    estimatedInputTokens: 300,
    estimatedOutputTokens: 580,
    temperature: 0
  },
  prompt4: {
    id: 'prompt4',
    title: 'Key Market Players & Strategic Developments',
    description: 'Generate key players list and recent developments',
    template: 'Create Key Players section for {title}. Context: {context}. Part 1: List top 10 verified companies (publicly traded/recognized). Part 2: Provide 1-2 real 2024 developments with format "[Month] 2024: [Company] [action] to [outcome]". Use credible company names only, no placeholders.',
    maxTokens: 450,
    estimatedInputTokens: 350,
    estimatedOutputTokens: 350,
    temperature: 0
  }
};

export const TOKEN_PRICING = {
  GPT_4O_MINI: {
    inputTokens: 0.15, // per 1M tokens
    outputTokens: 0.60, // per 1M tokens
    currency: 'USD'
  }
};

export const OPTIMIZATION_STRATEGIES: OptimizationStrategy[] = [
  {
    name: 'Concise Prompt Engineering',
    description: 'Remove unnecessary words and avoid politeness',
    tokenSavingsPercentage: 30,
    enabled: true
  },
  {
    name: 'Context Compression', 
    description: 'Summarize previous outputs for context',
    tokenSavingsPercentage: 40,
    enabled: true
  },
  {
    name: 'Temperature Optimization',
    description: 'Use temperature 0 for deterministic responses',
    tokenSavingsPercentage: 15,
    enabled: true
  },
  {
    name: 'Max Tokens Limiting',
    description: 'Set appropriate output limits',
    tokenSavingsPercentage: 25,
    enabled: true
  }
];