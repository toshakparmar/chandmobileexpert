import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  Header,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, PaymentStatus } from '@prisma/client';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Generates or fetches live UPI dynamic QR code and intent URI
   */
  @Get('instructions/:orderId')
  @Header('Cache-Control', 'no-store, no-cache, must-revalidate')
  getInstructions(@Param('orderId') orderId: string, @Req() req: any) {
    return this.paymentsService.getPaymentInstructions(orderId, req.user?.id);
  }

  /**
   * Customer submits their 12-digit UPI UTR number and optional payment screenshot
   */
  @Post(':id/submit')
  submitUtr(
    @Param('id') paymentId: string,
    @Body('utr') utr: string,
    @Body('screenshotUrl') screenshotUrl?: string,
    @Req() req?: any
  ) {
    return this.paymentsService.submitUtr(paymentId, utr, screenshotUrl, req?.user?.id);
  }

  /**
   * Admin: List payments awaiting verification or filter by status
   */
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  findAll(@Query('status') status?: PaymentStatus) {
    return this.paymentsService.findAll(status);
  }

  /**
   * Admin: Verify payment (validates against shop owner's bank statement)
   */
  @Post(':id/verify')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  verifyPayment(
    @Param('id') paymentId: string,
    @Req() req: any,
    @Body('notes') notes?: string
  ) {
    return this.paymentsService.verifyPayment(req.user.id, paymentId, notes);
  }

  /**
   * Admin: Reject payment (with reason for the customer to resubmit)
   */
  @Post(':id/reject')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  rejectPayment(
    @Param('id') paymentId: string,
    @Req() req: any,
    @Body('reason') reason: string
  ) {
    return this.paymentsService.rejectPayment(req.user.id, paymentId, reason);
  }
}

