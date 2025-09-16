import { prisma } from "@/lib/prisma";

export async function getAnalyticsOverview() {
  const period = 30; // days

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - period);

  const prevEndDate = new Date(startDate);
  const prevStartDate = new Date(startDate);
  prevStartDate.setDate(startDate.getDate() - period);

  const [currentPeriodData, previousPeriodData] = await Promise.all([
    fetchOverviewData(startDate, endDate),
    fetchOverviewData(prevStartDate, prevEndDate),
  ]);

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  return {
    totalReports: currentPeriodData.totalReports,
    reportsChange: calculateChange(
      currentPeriodData.totalReports,
      previousPeriodData.totalReports
    ),
    totalOrders: currentPeriodData.totalOrders,
    ordersChange: calculateChange(
      currentPeriodData.totalOrders,
      previousPeriodData.totalOrders
    ),
    totalRevenue: currentPeriodData.totalRevenue,
    revenueChange: calculateChange(
      currentPeriodData.totalRevenue,
      previousPeriodData.totalRevenue
    ),
    totalUsers: currentPeriodData.totalUsers,
    usersChange: calculateChange(
      currentPeriodData.totalUsers,
      previousPeriodData.totalUsers
    ),
  };
}

async function fetchOverviewData(startDate: Date, endDate: Date) {
  const [
    totalReports,
    totalOrders,
    totalUsers,
    totalRevenue,
  ] = await Promise.all([
    prisma.report.count({ where: { status: "ACTIVE", createdAt: { gte: startDate, lte: endDate } } }),
    prisma.order.count({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: "COMPLETED",
      },
    }),
    prisma.user.count({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: "ACTIVE",
      },
    }),
    prisma.order.aggregate({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        paymentStatus: "COMPLETED",
      },
      _sum: { total: true },
    }),
  ]);

  return {
    totalReports,
    totalOrders,
    totalUsers,
    totalRevenue: totalRevenue._sum.total?.toNumber() || 0,
  };
}
