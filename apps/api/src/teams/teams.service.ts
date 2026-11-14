import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: any) { return this.prisma.teamMember.create({ data: dto }); }

  async findAll() {
    return this.prisma.teamMember.findMany({ orderBy: { createdAt: 'asc' } });
  }

  async findOne(id: string) { return this.prisma.teamMember.findUnique({ where: { id } }); }

  async update(id: string, dto: any) { return this.prisma.teamMember.update({ where: { id }, data: dto }); }

  async remove(id: string) { return this.prisma.teamMember.delete({ where: { id } }); }
}