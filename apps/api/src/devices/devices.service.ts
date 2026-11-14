import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any) {
    return this.prisma.device.create({ data: dto });
  }

  async findAll() {
    return this.prisma.device.findMany({
      where: { isActive: true },
      include: {
        brand: true,
        services: {
          where: { isActive: true },
          include: { service: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.device.findUnique({
      where: { id },
      include: {
        brand: true,
        services: {
          include: { service: true },
        },
      },
    });
  }

  async update(id: string, dto: any) {
    return this.prisma.device.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return this.prisma.device.delete({ where: { id } });
  }
}