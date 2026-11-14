import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any) {
    return this.prisma.service.create({ data: dto });
  }

  async findAll() {
    return this.prisma.service.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.service.findUnique({ where: { id } });
  }

  async update(id: string, dto: any) {
    return this.prisma.service.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return this.prisma.service.delete({ where: { id } });
  }
}