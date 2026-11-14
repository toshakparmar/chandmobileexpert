import { PartialType } from '@nestjs/mapped-types';
import { CreateGeneralEnquiryDto } from './create-general-enquiry.dto';

export class UpdateGeneralEnquiryDto extends PartialType(
  CreateGeneralEnquiryDto,
) {}
