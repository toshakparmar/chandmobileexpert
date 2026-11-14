import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const AddToCartSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
});

export class AddToCartDto extends createZodDto(AddToCartSchema) {}
