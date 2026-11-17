import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async create(data: any) {
    if (data.password) {
      const bcrypt = require('bcrypt');
      data.password = await bcrypt.hash(data.password, 10);
    }
    return this.prisma.user.create({
      data,
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id }
    });
  }

  async update(id: string, data: any) {
    if (data.password) {
      const bcrypt = require('bcrypt');
      data.password = await bcrypt.hash(data.password, 10);
    }
    return this.prisma.user.update({
      where: { id },
      data
    });
  }

  async remove(id: string) {
    return this.prisma.user.delete({
      where: { id }
    });
  }

  async getAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createAddress(userId: string, data: any) {
    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return this.prisma.address.create({
      data: {
        userId,
        name: data.name || null,
        phone: data.phone || null,
        tag: data.tag || data.type || 'HOME',
        street: data.street || '',
        landmark: data.landmark || null,
        city: data.city || '',
        state: data.state || '',
        postalCode: data.postalCode || '',
        country: data.country || 'IN',
        isDefault: !!data.isDefault,
      },
    });
  }

  async updateAddress(userId: string, addressId: string, data: any) {
    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return this.prisma.address.update({
      where: { id: addressId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.tag !== undefined && { tag: data.tag }),
        ...(data.street !== undefined && { street: data.street }),
        ...(data.landmark !== undefined && { landmark: data.landmark }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.state !== undefined && { state: data.state }),
        ...(data.postalCode !== undefined && { postalCode: data.postalCode }),
        ...(data.country !== undefined && { country: data.country }),
        ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
      },
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    return this.prisma.address.deleteMany({
      where: { id: addressId, userId },
    });
  }

  async setDefaultAddress(userId: string, addressId: string) {
    await this.prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
    return this.prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
  }
}
