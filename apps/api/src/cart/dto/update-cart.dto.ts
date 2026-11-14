import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateCartSchema = z.object({
  quantity: z.number().int().positive(),
});

export class UpdateCartDto extends createZodDto(UpdateCartSchema) {}
