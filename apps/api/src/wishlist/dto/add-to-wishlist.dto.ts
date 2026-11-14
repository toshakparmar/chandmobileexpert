import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const AddToWishlistSchema = z.object({
  productId: z.string().uuid(),
});

export class AddToWishlistDto extends createZodDto(AddToWishlistSchema) {}
