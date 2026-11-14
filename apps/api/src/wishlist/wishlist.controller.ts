import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('wishlist')
@UseGuards(AuthGuard('jwt'))
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  getWishlist(@Req() req: any) {
    return this.wishlistService.getWishlist(req.user.id);
  }

  @Post('items')
  addToWishlist(@Req() req: any, @Body() dto: AddToWishlistDto) {
    return this.wishlistService.addToWishlist(req.user.id, dto);
  }

  @Delete('items/:productId')
  removeFromWishlist(@Req() req: any, @Param('productId') productId: string) {
    return this.wishlistService.removeFromWishlist(req.user.id, productId);
  }
}
