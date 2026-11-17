import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateBookRepairDto } from './dto/create-book-repair.dto';

@Injectable()
export class BookRepairsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBookRepairDto, userId?: string) {
    return this.prisma.repairQuery.create({
      data: {
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        deviceModel: dto.deviceModel,
        issueDesc: dto.issueDesc,
        userId: userId, // Optional, only if logged in
        status: 'PENDING',
      },
    });
  }

  async findAll() {
    return this.prisma.repairQuery.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      }
    });
  }

  async findOne(id: string) {
    return this.prisma.repairQuery.findUnique({ 
      where: { id },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      }
    });
  }

  async update(id: string, dto: any) {
    return this.prisma.repairQuery.update({
      where: { id },
      data: {
        status: dto.status,
        adminNotes: dto.adminNotes,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.repairQuery.delete({ where: { id } });
  }

  async getUserQueries(userId?: string, phone?: string) {
    if (!userId && !phone) return [];
    return this.prisma.repairQuery.findMany({
      where: {
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(phone ? [{ customerPhone: phone }] : []),
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}