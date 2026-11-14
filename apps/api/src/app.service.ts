import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getAnalytics() {
    const totalUsers = await this.prisma.user.count();
    const totalOrders = await this.prisma.order.count();
    const totalRevenue = await this.prisma.order.aggregate({
      _sum: { totalAmount: true }
    });
    
    const pendingRepairs = await this.prisma.repairQuery.count({
      where: { status: 'PENDING' }
    });
    const totalRepairs = await this.prisma.repairQuery.count();

    const pendingEnquiries = await this.prisma.generalEnquiry.count({
      where: { isResolved: false }
    });

    const recentOrders = await this.prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true } }
      }
    });

    return {
      totalUsers,
      totalOrders,
      totalRevenue: totalRevenue._sum?.totalAmount || 0,
      pendingRepairs,
      totalRepairs,
      pendingEnquiries,
      recentOrders,
    };
  }
}
