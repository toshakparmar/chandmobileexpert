import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async getWishlist(userId: string) {
    return this.prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: true,
      },
    });
  }

  async addToWishlist(userId: string, dto: AddToWishlistDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product || !product.isActive) {
      throw new NotFoundException('Product not found or not active');
    }

    const existing = await this.prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: dto.productId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Product already in wishlist');
    }

    await this.prisma.wishlist.create({
      data: {
        userId,
        productId: dto.productId,
      },
    });

    return this.getWishlist(userId);
  }

  async removeFromWishlist(userId: string, productId: string) {
    await this.prisma.wishlist.deleteMany({
      where: {
        userId,
        productId,
      },
    });

    return this.getWishlist(userId);
  }
}
