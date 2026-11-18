import { Controller, Get, Post, Body, Patch, UseGuards } from '@nestjs/common';
import { BusinessProfileService } from './business-profile.service';
import { CreateBusinessProfileDto } from './dto/create-business-profile.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('business-profile')
export class BusinessProfileController {
  constructor(
    private readonly businessProfileService: BusinessProfileService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  create(@Body() createBusinessProfileDto: CreateBusinessProfileDto) {
    return this.businessProfileService.create(createBusinessProfileDto);
  }

  @Get()
  findOne() {
    return this.businessProfileService.findOne();
  }

  @Patch()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  update(@Body() dto: any) {
    return this.businessProfileService.update(dto);
  }
}
