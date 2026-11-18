import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';

@Injectable()
export class TestimonialsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(dto: any) {
    return this.prisma.testimonial.create({ data: dto });
  }

  async findAll() {
    return this.prisma.testimonial.findMany();
  }

  async findOne(id: string) {
    return this.prisma.testimonial.findUnique({ where: { id } });
  }

  async update(id: string, dto: any) {
    return this.prisma.testimonial.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return this.prisma.testimonial.delete({ where: { id } });
  }
}
