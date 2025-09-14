import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period))

    // Get overview statistics
    const [
      totalReports,
      totalOrders,
      totalUsers,
      totalRevenue,
      recentOrders,
      topReports,
      translationStats,
      aiUsageStats
    ] = await Promise.all([
      prisma.report.count({ where: { status: 'ACTIVE' } }),
      
      prisma.order.count({
        where: {
          createdAt: { gte: startDate },
          status: 'COMPLETED'
        }
      }),
      
      prisma.user.count({
        where: {
          createdAt: { gte: startDate },
          status: 'ACTIVE'
        }
      }),
      
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startDate },
          paymentStatus: 'COMPLETED'
        },
        _sum: { total: true }
      }),
      
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              report: {
                select: { title: true }
              }
            }
          }
        }
      }),
      
      prisma.report.findMany({
        take: 10,
        orderBy: { downloadCount: 'desc' },
        select: {
          id: true,
          title: true,
          downloadCount: true,
          viewCount: true,
          _count: {
            select: { orderItems: true }
          }
        }
      }),
      
      prisma.translationJob.groupBy({
        by: ['status'],
        _count: true,
        where: {
          createdAt: { gte: startDate }
        }
      }),
      
      prisma.apiUsageLog.aggregate({
        where: {
          createdAt: { gte: startDate }
        },
        _sum: {
          totalTokens: true,
          totalCost: true
        },
        _count: true
      })
    ])

    return NextResponse.json({
      overview: {
        totalReports,
        totalOrders,
        totalUsers,
        totalRevenue: totalRevenue._sum.total || 0
      },
      recentOrders,
      topReports,
      translationStats,
      aiUsage: {
        totalTokens: aiUsageStats._sum.totalTokens || 0,
        totalCost: aiUsageStats._sum.totalCost || 0,
        totalRequests: aiUsageStats._count
      }
    })

  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
