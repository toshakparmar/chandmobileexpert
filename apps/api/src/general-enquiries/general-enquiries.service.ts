import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateGeneralEnquiryDto } from './dto/create-general-enquiry.dto';
import { UpdateGeneralEnquiryDto } from './dto/update-general-enquiry.dto';

@Injectable()
export class GeneralEnquiriesService {
  constructor(private readonly prisma: PrismaService) {}
  async create(dto: any) {
    return this.prisma.generalEnquiry.create({ data: dto });
  }

  async findAll() {
    return this.prisma.generalEnquiry.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.generalEnquiry.findUnique({ where: { id } });
  }

  async update(id: string, dto: any) {
    return this.prisma.generalEnquiry.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return this.prisma.generalEnquiry.delete({ where: { id } });
  }
}
