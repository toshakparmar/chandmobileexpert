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
      const [totalUsers, totalOrders, totalRevenue, pendingRepairs, totalRepairs, pendingEnquiries, recentOrders] = await Promise.all([
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
        this.prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { email: true } }
          }
        }).catch(() => []),
      ]);

      return {
        totalUsers,
        totalOrders,
        totalRevenue: Number(totalRevenue._sum?.totalAmount || 0),
        pendingRepairs,
        totalRepairs,
        pendingEnquiries,
        recentOrders: recentOrders.map((o: any) => ({
          ...o,
          totalAmount: Number(o.totalAmount || 0),
        })),
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
        recentOrders: [],
      };
    }
  }
}
