import { PartialType } from '@nestjs/mapped-types';
import { CreateBookRepairDto } from './create-book-repair.dto';

export class UpdateBookRepairDto extends PartialType(CreateBookRepairDto) { }
