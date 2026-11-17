import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req, Query, Headers, BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';
import { OptionalJwtAuthGuard } from '../auth/jwt-auth.guard';
import { CheckoutDto } from './dto/checkout.dto';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Admin: Get all orders
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  findAll() {
    return this.ordersService.findAll();
  }

  // User: Get their own orders
  @Get('my-orders')
  @UseGuards(OptionalJwtAuthGuard)
  getUserOrders(
    @Req() req: any,
    @Query('email') email?: string,
    @Query('phone') phone?: string,
  ) {
    return this.ordersService.getUserOrders(req.user?.id, email, phone);
  }

  // User: Checkout flow (creates order from cart & records in database)
  @Post('checkout')
  async checkout(
    @Req() req: any,
    @Body() dto: CheckoutDto,
  ) {
    const userId = req.user?.id || dto.userId;
    try {
      return await this.ordersService.checkout(userId, dto);
    } catch (err: any) {
      console.error('=== CHECKOUT FAILED IN CONTROLLER ===', err);
      throw new BadRequestException(err?.message || 'Checkout failed');
    }
  }

  // Admin: Update order status
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() data: any) {
    return this.ordersService.update(id, data);
  }

  // Admin: Delete order
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
