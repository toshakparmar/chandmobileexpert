import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CheckoutSchema = z.object({
  shippingAddressId: z.string().optional(),
  billingAddressId: z.string().optional(),
  userId: z.string().optional(),
  userEmail: z.string().optional(),
  userName: z.string().optional(),
  userPhone: z.string().optional(),
  newShippingAddress: z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
      tag: z.string().optional(),
      street: z.string(),
      landmark: z.string().optional(),
      city: z.string(),
      state: z.string().optional(),
      postalCode: z.string(),
      country: z.string().default('IN'),
    })
    .optional(),
  paymentMethod: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
      }),
    )
    .optional(),
});

export class CheckoutDto extends createZodDto(CheckoutSchema) {}
