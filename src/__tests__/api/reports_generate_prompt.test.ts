import { prisma } from '@/lib/prisma';
import { createMocks } from 'node-mocks-http';
import { POST as generatePOST } from '@/app/api/reports/generate/route';
import { NextRequest } from 'next/server';

// Mock next-auth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  prisma: {
    report: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    },
    apiUsageLog: {
      create: jest.fn(),
    },
    aiPromptTemplate: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock @/lib/utils
jest.mock('@/lib/utils', () => ({
  generateSlug: jest.fn((title) => title.toLowerCase().replace(/\s/g, '-')),
  generateSKU: jest.fn(() => 'FM-SKU-123'),
}));

// Mock OpenAI
let mockCreate: jest.Mock;
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: (...args: any[]) => mockCreate(...args),
      },
    },
  }));
});

describe('POST /api/reports/generate Prompt Check', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreate = jest.fn();
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'Generated Content' } }],
      usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
      model: 'gpt-4o',
    });
  });

  it('should send the enhanced prompt with detailed instructions', async () => {
    const generateData = { title: 'New AI Report' };
    
    // Mock prompt templates
    (prisma.aiPromptTemplate.findUnique as jest.Mock).mockResolvedValue({ templateText: 'Base Prompt' });
    (prisma.report.create as jest.Mock).mockResolvedValue({ id: 'new-report-id', ...generateData });

    const { req } = createMocks({
      method: 'POST',
      json: () => Promise.resolve(generateData),
    });

    await generatePOST(req as unknown as NextRequest);

    // Verify calls
    expect(mockCreate).toHaveBeenCalledTimes(4); // 4 sections

    // Check the first call's arguments
    const firstCallArgs = mockCreate.mock.calls[0][0];
    const messages = firstCallArgs.messages;
    const userMessage = messages.find((m: any) => m.role === 'user');
    
    expect(userMessage.content).toContain('**IGNORE** any constraints about word count');
    expect(userMessage.content).toContain('write a **detailed, comprehensive, and extensive** section');
    expect(userMessage.content).toContain('**EXPAND** on every point.');
    expect(userMessage.content).toContain('**DATA SIMULATION**');
  });
});
