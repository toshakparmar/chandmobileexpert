import { Injectable } from '@nestjs/common';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any) { return this.prisma.subCategory.create({ data: dto }); }

  async findAll() {
    return this.prisma.subCategory.findMany({
      include: {
        category: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string) { return this.prisma.subCategory.findUnique({ where: { id } }); }

  async update(id: string, dto: any) { return this.prisma.subCategory.update({ where: { id }, data: dto }); }

  async remove(id: string) { return this.prisma.subCategory.delete({ where: { id } }); }
}