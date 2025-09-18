import { createMocks } from 'node-mocks-http'
import { GET, POST } from '@/app/api/reports/route'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    report: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn()
    }
  }
}))

// Mock next-auth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(() => Promise.resolve({
    user: { id: '1', role: 'SUPERADMIN' }
  }))
}))

describe('/api/reports', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('returns reports with pagination', async () => {
      const mockReports = [
        { id: '1', title: 'Test Report 1' },
        { id: '2', title: 'Test Report 2' }
      ]

      ;(prisma.report.findMany as jest.Mock).mockResolvedValue(mockReports)
      ;(prisma.report.count as jest.Mock).mockResolvedValue(2)

      const { req } = createMocks({
        method: 'GET',
        url: '/api/reports?page=1&limit=25'
      })

      const response = await GET(req as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.reports).toEqual(mockReports)
      expect(data.pagination).toEqual({
        page: 1,
        limit: 25,
        total: 2,
        totalPages: 1
      })
    })

    it('handles search queries', async () => {
      ;(prisma.report.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.report.count as jest.Mock).mockResolvedValue(0)

      const { req } = createMocks({
        method: 'GET',
        url: '/api/reports?search=artificial+intelligence'
      })

      await GET(req as NextRequest)

      expect(prisma.report.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { title: { contains: 'artificial intelligence', mode: 'insensitive' } }
            ])
          })
        })
      )
    })
  })

  describe('POST', () => {
    it('creates a new report', async () => {
      const mockReport = {
        id: '1',
        title: 'New Report',
        slug: 'new-report'
      }

      ;(prisma.report.create as jest.Mock).mockResolvedValue(mockReport)

      const { req } = createMocks({
        method: 'POST',
        body: {
          title: 'New Report',
          description: 'This is a new report description for testing purposes.',
          metaTitle: 'New Report Meta Title',
          metaDescription: 'New report meta description',
          publishedDate: '2025-01-01'
        }
      })

      const response = await POST(req as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.report).toEqual(mockReport)
    })

    it('validates required fields', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          title: 'A', // Too short
          description: 'Short' // Too short
        }
      })

      const response = await POST(req as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation error')
    })
  })
})
