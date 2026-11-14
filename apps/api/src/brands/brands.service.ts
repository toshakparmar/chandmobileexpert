import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any) {
    return this.prisma.brand.create({ data: dto });
  }

  async findAll() {
    return this.prisma.brand.findMany({
      where: { isActive: true },
      include: {
        devices: {
          where: { isActive: true },
          include: {
            services: {
              where: { isActive: true },
              include: { service: true },
            },
          },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.brand.findUnique({
      where: { id },
      include: {
        devices: {
          include: {
            services: {
              include: { service: true },
            },
          },
        },
      },
    });
  }

  async update(id: string, dto: any) {
    return this.prisma.brand.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return this.prisma.brand.delete({ where: { id } });
  }
}