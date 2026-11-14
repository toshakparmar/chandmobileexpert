import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateBookRepairSchema = z.object({
  customerName: z.string().min(1, 'Name is required'),
  customerPhone: z.string().min(1, 'Phone is required'),
  deviceModel: z.string().min(1, 'Device model is required'),
  issueDesc: z.string().min(1, 'Issue description is required'),
});

export class CreateBookRepairDto extends createZodDto(CreateBookRepairSchema) {}
