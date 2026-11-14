import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any) { return this.prisma.category.create({ data: dto }); }

  async findAll() {
    return this.prisma.category.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) { return this.prisma.category.findUnique({ where: { id } }); }

  async update(id: string, dto: any) { return this.prisma.category.update({ where: { id }, data: dto }); }

  async remove(id: string) { return this.prisma.category.delete({ where: { id } }); }
}