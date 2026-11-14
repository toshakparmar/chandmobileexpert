import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { PrismaModule } from './prisma/prisma.module';
import { TeamsModule } from './teams/teams.module';
import { SubCategoriesModule } from './sub-categories/sub-categories.module';
import { ServicesModule } from './services/services.module';
import { DevicesModule } from './devices/devices.module';
import { BrandsModule } from './brands/brands.module';
import { BusinessProfileModule } from './business-profile/business-profile.module';
import { CategoriesModule } from './categories/categories.module';
import { FaqsModule } from './faqs/faqs.module';
import { GeneralEnquiriesModule } from './general-enquiries/general-enquiries.module';
import { BookRepairsModule } from './book-repairs/book-repairs.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { CartModule } from './cart/cart.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),
    AuthModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
    PaymentsModule,
    PrismaModule,
    TeamsModule,
    SubCategoriesModule,
    ServicesModule,
    DevicesModule,
    BrandsModule,
    BusinessProfileModule,
    CategoriesModule,
    FaqsModule,
    GeneralEnquiriesModule,
    BookRepairsModule,
    TestimonialsModule,
    CartModule,
    WishlistModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
