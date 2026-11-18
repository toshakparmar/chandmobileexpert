import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GeneralEnquiriesService } from './general-enquiries.service';
import { CreateGeneralEnquiryDto } from './dto/create-general-enquiry.dto';
import { UpdateGeneralEnquiryDto } from './dto/update-general-enquiry.dto';

@Controller('general-enquiries')
export class GeneralEnquiriesController {
  constructor(
    private readonly generalEnquiriesService: GeneralEnquiriesService,
  ) {}

  @Post()
  create(@Body() createGeneralEnquiryDto: CreateGeneralEnquiryDto) {
    return this.generalEnquiriesService.create(createGeneralEnquiryDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  findAll() {
    return this.generalEnquiriesService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  findOne(@Param('id') id: string) {
    return this.generalEnquiriesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() updateGeneralEnquiryDto: any) {
    return this.generalEnquiriesService.update(id, updateGeneralEnquiryDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.generalEnquiriesService.remove(id);
  }
}
