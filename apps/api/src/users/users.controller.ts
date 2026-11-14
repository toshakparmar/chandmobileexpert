import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req) {
    return this.usersService.findOne(req.user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMe(@Req() req, @Body() data: any) {
    return this.usersService.update(req.user.id, data);
  }

  // Address endpoints for current user
  @Get('me/addresses')
  @UseGuards(JwtAuthGuard)
  getMyAddresses(@Req() req) {
    return this.usersService.getAddresses(req.user.id);
  }

  @Post('me/addresses')
  @UseGuards(JwtAuthGuard)
  createMyAddress(@Req() req, @Body() data: any) {
    return this.usersService.createAddress(req.user.id, data);
  }

  @Patch('me/addresses/:id')
  @UseGuards(JwtAuthGuard)
  updateMyAddress(@Req() req, @Param('id') id: string, @Body() data: any) {
    return this.usersService.updateAddress(req.user.id, id, data);
  }

  @Delete('me/addresses/:id')
  @UseGuards(JwtAuthGuard)
  deleteMyAddress(@Req() req, @Param('id') id: string) {
    return this.usersService.deleteAddress(req.user.id, id);
  }

  @Patch('me/addresses/:id/default')
  @UseGuards(JwtAuthGuard)
  setDefaultAddress(@Req() req, @Param('id') id: string) {
    return this.usersService.setDefaultAddress(req.user.id, id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() data: any) {
    return this.usersService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
