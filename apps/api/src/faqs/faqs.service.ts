import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@Injectable()
export class FaqsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(dto: any) { return this.prisma.fAQ.create({ data: dto }); }

  async findAll() {
    return this.prisma.fAQ.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) { return this.prisma.fAQ.findUnique({ where: { id } }); }

  async update(id: string, dto: any) { return this.prisma.fAQ.update({ where: { id }, data: dto }); }

  async remove(id: string) { return this.prisma.fAQ.delete({ where: { id } }); }
}