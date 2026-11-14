import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('cart')
@UseGuards(AuthGuard('jwt'))
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() req: any) {
    return this.cartService.getCart(req.user.id);
  }

  @Post('items')
  addToCart(@Req() req: any, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(req.user.id, dto);
  }

  @Patch('items/:productId')
  updateItemQuantity(
    @Req() req: any,
    @Param('productId') productId: string,
    @Body() dto: UpdateCartDto,
  ) {
    return this.cartService.updateItemQuantity(req.user.id, productId, dto);
  }

  @Delete('items/:productId')
  removeItem(@Req() req: any, @Param('productId') productId: string) {
    return this.cartService.removeItem(req.user.id, productId);
  }

  @Delete()
  clearCart(@Req() req: any) {
    return this.cartService.clearCart(req.user.id);
  }
}
