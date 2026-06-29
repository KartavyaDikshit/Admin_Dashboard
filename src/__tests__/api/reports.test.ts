import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { createMocks } from 'node-mocks-http';
import { GET, PATCH, DELETE } from '@/app/api/reports/[id]/route';
import { POST as generatePOST } from '@/app/api/reports/generate/route';
import { POST as publishPOST } from '@/app/api/reports/[id]/publish/route';
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
    reportTranslation: {
      upsert: jest.fn(),
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
jest.mock('openai', () => {
    return jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{ message: { content: '{"title":"Translated Title", "marketResearchSummary":"Translated Summary", "marketDynamics":"Translated Dynamics", "regionalInsights":"Translated Insights", "keyMarketPlayers":"Translated Players", "tableOfContents":"Translated ToC"}' } }],
            usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
            model: 'gpt-4o-mini',
          }),
        },
      },
    }));
  });

describe('Reports API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'test-user-id' },
    });
  });

  describe('GET /api/reports/[id]', () => {
    it('should return a single report', async () => {
      const mockReport = { id: 'report-1', title: 'Test Report', categories: [] };
      (prisma.report.findUnique as jest.Mock).mockResolvedValue(mockReport);

      const { req } = createMocks({ method: 'GET' });
      const response = await GET(req as NextRequest, { params: { id: 'report-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockReport);
    });
  });

  describe('PATCH /api/reports/[id]', () => {
    it('should update an existing report', async () => {
      const updateData = { title: 'Updated Report' };
      const updatedReport = { id: 'report-1', ...updateData };
      (prisma.report.update as jest.Mock).mockResolvedValue(updatedReport);

      const { req } = createMocks({
        method: 'PATCH',
        json: () => Promise.resolve(updateData),
      });

      const response = await PATCH(req as unknown as NextRequest, { params: { id: 'report-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedReport);
    });
  });

  describe('DELETE /api/reports/[id]', () => {
    it('should delete a report', async () => {
      (prisma.report.delete as jest.Mock).mockResolvedValue({ id: 'report-1' });
      const { req } = createMocks({ method: 'DELETE' });
      const response = await DELETE(req as NextRequest, { params: { id: 'report-1' } });
      
      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/reports/generate', () => {
    it('should create a new report', async () => {
        const generateData = { title: 'New AI Report' };
        const createdReport = { id: 'new-report-id', ...generateData };
        
        // Mock prompt templates
        (prisma.aiPromptTemplate.findUnique as jest.Mock).mockResolvedValue({ templateText: 'Test Prompt' });
        (prisma.report.create as jest.Mock).mockResolvedValue(createdReport);
  
        const { req } = createMocks({
          method: 'POST',
          json: () => Promise.resolve(generateData),
        });
  
        const response = await generatePOST(req as unknown as NextRequest);
        const data = await response.json();
  
        expect(response.status).toBe(201);
        expect(data).toEqual(createdReport);
      });
  });

  describe('POST /api/reports/[id]/publish', () => {
    it('should publish a report and create translations', async () => {
        const mockReport = { 
            id: 'report-1', 
            title: 'Test Report',
            keyFindings: [],
            keywords: [],
            semanticKeywords: [],
            longTailKeywords: []
        };
        (prisma.report.findUnique as jest.Mock).mockResolvedValue(mockReport);
        (prisma.report.update as jest.Mock).mockResolvedValue({ ...mockReport, status: 'PUBLISHED' });

        const { req } = createMocks({ method: 'POST' });
        const response = await publishPOST(req as NextRequest, { params: { id: 'report-1' } });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(prisma.reportTranslation.upsert).toHaveBeenCalledTimes(6); // 6 languages
        expect(prisma.report.update).toHaveBeenCalledWith({
            where: { id: 'report-1' },
            data: { status: 'PUBLISHED' },
        });
    });
  });

});