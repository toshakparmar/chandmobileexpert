import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        subCategory: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(idOrSlug: string) {
    return this.prisma.product.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        subCategory: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true } },
      },
    });
  }

  async create(data: any) {
    const slug =
      data.slug ||
      (data.name
        ? data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '') +
          '-' +
          Date.now().toString(36)
        : `product-${Date.now()}`);

    const price = data.price ?? data.basePrice ?? 0;
    const discountPrice = data.discountPrice ?? data.salePrice ?? null;
    const stockCount =
      data.stockCount ?? (data.stockStatus === 'OUT_OF_STOCK' ? 0 : 10);
    const inStock = data.inStock ?? stockCount > 0;

    return this.prisma.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description || data.name,
        price,
        discountPrice,
        image: data.image || null,
        sku: data.sku || null,
        stockCount,
        inStock,
        isActive: data.isActive ?? true,
        categoryId: data.categoryId,
        subCategoryId: data.subCategoryId || null,
        brandId: data.brandId || null,
      },
      include: {
        category: true,
        subCategory: true,
        brand: true,
      },
    });
  }

  async update(id: string, data: any) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.price !== undefined || data.basePrice !== undefined) {
      updateData.price = data.price ?? data.basePrice;
    }
    if (data.discountPrice !== undefined || data.salePrice !== undefined) {
      updateData.discountPrice = data.discountPrice ?? data.salePrice;
    }
    if (data.image !== undefined) updateData.image = data.image;
    if (data.stockCount !== undefined) {
      updateData.stockCount = data.stockCount;
      updateData.inStock = data.stockCount > 0;
    }
    if (data.inStock !== undefined) updateData.inStock = data.inStock;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.subCategoryId !== undefined)
      updateData.subCategoryId = data.subCategoryId || null;
    if (data.brandId !== undefined) updateData.brandId = data.brandId || null;
    if (data.sku !== undefined) updateData.sku = data.sku || null;

    return this.prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        subCategory: true,
        brand: true,
      },
    });
  }

  async remove(id: string) {
    // Soft-delete by setting isActive to false to prevent breaking order history relations
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
