import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getAnalytics() {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setDate(1);
      sixMonthsAgo.setHours(0, 0, 0, 0);

      const [
        totalUsers,
        totalOrders,
        totalRevenue,
        pendingRepairs,
        totalRepairs,
        pendingEnquiries,
        pendingUpiPayments,
        totalProducts,
        recentOrders,
        recentRepairQueries,
        orderStatusDistribution,
        sixMonthOrders
      ] = await Promise.all([
        this.prisma.user.count().catch(() => 0),
        this.prisma.order.count().catch(() => 0),
        this.prisma.order.aggregate({
          _sum: { totalAmount: true }
        }).catch(() => ({ _sum: { totalAmount: 0 } })),
        this.prisma.repairQuery.count({
          where: { status: 'PENDING' }
        }).catch(() => 0),
        this.prisma.repairQuery.count().catch(() => 0),
        this.prisma.generalEnquiry.count({
          where: { isResolved: false }
        }).catch(() => 0),
        this.prisma.payment.count({
          where: { status: 'AWAITING_VERIFICATION' }
        }).catch(() => 0),
        this.prisma.product.count().catch(() => 0),
        this.prisma.order.findMany({
          take: 6,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { email: true, firstName: true, lastName: true } },
            payment: { select: { status: true, method: true, utr: true } },
          }
        }).catch(() => []),
        this.prisma.repairQuery.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
        }).catch(() => []),
        this.prisma.order.groupBy({
          by: ['status'],
          _count: { status: true },
        }).catch(() => []),
        this.prisma.order.findMany({
          where: { createdAt: { gte: sixMonthsAgo } },
          select: { createdAt: true, totalAmount: true, status: true },
        }).catch(() => []),
      ]);

      // Calculate monthly aggregations for last 6 months
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyDataMap: Record<string, { revenue: number; orders: number }> = {};
      const monthsList: string[] = [];

      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const label = monthNames[d.getMonth()];
        monthsList.push(label);
        monthlyDataMap[label] = { revenue: 0, orders: 0 };
      }

      sixMonthOrders.forEach((o: any) => {
        const m = monthNames[new Date(o.createdAt).getMonth()];
        if (monthlyDataMap[m]) {
          monthlyDataMap[m].orders += 1;
          monthlyDataMap[m].revenue += Number(o.totalAmount || 0);
        }
      });

      const monthlyChart = {
        categories: monthsList,
        revenue: monthsList.map((m) => Math.round(monthlyDataMap[m].revenue)),
        orders: monthsList.map((m) => monthlyDataMap[m].orders),
      };

      const statusMap: Record<string, number> = {
        PENDING: 0,
        CONFIRMED: 0,
        PROCESSING: 0,
        SHIPPED: 0,
        DELIVERED: 0,
        CANCELLED: 0,
      };

      orderStatusDistribution.forEach((item: any) => {
        if (item.status && statusMap[item.status] !== undefined) {
          statusMap[item.status] = item._count.status;
        }
      });

      return {
        totalUsers,
        totalOrders,
        totalRevenue: Number(totalRevenue._sum?.totalAmount || 0),
        pendingRepairs,
        totalRepairs,
        pendingEnquiries,
        pendingUpiPayments,
        totalProducts,
        monthlyChart,
        orderStatusDistribution: statusMap,
        recentOrders: recentOrders.map((o: any) => ({
          ...o,
          totalAmount: Number(o.totalAmount || 0),
        })),
        recentRepairQueries,
      };
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      return {
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingRepairs: 0,
        totalRepairs: 0,
        pendingEnquiries: 0,
        pendingUpiPayments: 0,
        totalProducts: 0,
        monthlyChart: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], revenue: [0, 0, 0, 0, 0, 0], orders: [0, 0, 0, 0, 0, 0] },
        orderStatusDistribution: { PENDING: 0, CONFIRMED: 0, PROCESSING: 0, SHIPPED: 0, DELIVERED: 0, CANCELLED: 0 },
        recentOrders: [],
        recentRepairQueries: [],
      };
    }
  }
}
