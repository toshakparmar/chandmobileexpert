import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateGeneralEnquirySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone is required'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
});

export class CreateGeneralEnquiryDto extends createZodDto(
  CreateGeneralEnquirySchema,
) {}
