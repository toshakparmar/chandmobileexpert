import { Module } from '@nestjs/common';
import { GeneralEnquiriesService } from './general-enquiries.service';
import { GeneralEnquiriesController } from './general-enquiries.controller';

@Module({
  controllers: [GeneralEnquiriesController],
  providers: [GeneralEnquiriesService],
})
export class GeneralEnquiriesModule {}
