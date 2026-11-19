import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus, OrderStatus } from '@prisma/client';
import * as QRCode from 'qrcode';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates or retrieves server-signed UPI intent instructions with dynamic QR code
   */
  async getPaymentInstructions(orderId: string, userId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order #${orderId} not found`);
    }

    if (userId && order.userId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this order payment',
      );
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('This order has been cancelled');
    }

    // Retrieve active business profile settings for UPI
    let profile = await this.prisma.businessProfile.findFirst();
    if (!profile) {
      profile = await this.prisma.businessProfile.create({
        data: {
          id: 1,
          companyName: 'Chand Mobile Expert',
          email: 'support@chandmobileexpert.com',
          phone: '+91 9876543210',
          whatsapp: '+91 9876543210',
          address: 'Main Market, Sarai Tarin, Sambhal, Uttar Pradesh 244302',
          openingHours: 'Mon - Sun: 10:00 AM - 9:00 PM',
          upiVpa: 'chandmobile@upi',
          upiPayeeName: 'Chand Mobile Expert',
          upiQrExpiryMinutes: 20,
          codEnabled: true,
          upiEnabled: true,
        },
      });
    }

    const upiVpa = profile.upiVpa || 'chandmobile@upi';
    const upiPayeeName = profile.upiPayeeName || 'Chand Mobile Expert';
    const expiryMinutes = profile.upiQrExpiryMinutes || 20;

    // Check existing payment record or create one
    let payment = order.payment;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
    const amountStr = Number(order.totalAmount).toFixed(2);
    const orderRef =
      order.orderNumber || `CME-${order.id.substring(0, 8).toUpperCase()}`;
    const paymentRef = `TR-${orderRef}-${Date.now().toString(36).toUpperCase()}`;

    // Standard NPCI UPI URI Specification
    const upiUri = `upi://pay?pa=${encodeURIComponent(upiVpa)}&pn=${encodeURIComponent(
      upiPayeeName,
    )}&am=${amountStr}&cu=INR&tn=${encodeURIComponent(
      `Payment for ${orderRef}`,
    )}&tr=${encodeURIComponent(paymentRef)}`;

    // Generate high-resolution QR data URL
    const qrCodeDataUrl = await QRCode.toDataURL(upiUri, {
      errorCorrectionLevel: 'M',
      width: 320,
      margin: 2,
      color: {
        dark: '#101828',
        light: '#ffffff',
      },
    });

    if (!payment) {
      payment = await this.prisma.payment.create({
        data: {
          orderId: order.id,
          method: 'UPI',
          status: PaymentStatus.AWAITING_PAYMENT,
          amount: order.totalAmount,
          upiVpa,
          upiReference: paymentRef,
          expiresAt,
        },
      });
    } else if (payment.status === PaymentStatus.AWAITING_PAYMENT) {
      payment = await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          upiReference: paymentRef,
          expiresAt,
        },
      });
    }

    return {
      paymentId: payment.id,
      orderId: order.id,
      orderNumber: orderRef,
      amount: Number(order.totalAmount),
      upiVpa,
      upiPayeeName,
      upiUri,
      qrCodeDataUrl,
      status: payment.status,
      expiresAt: payment.expiresAt,
      rejectionReason: payment.rejectionReason,
    };
  }

  /**
   * Customer submits 12-digit UTR transaction reference
   */
  async submitUtr(
    paymentId: string,
    utr: string,
    screenshotUrl?: string,
    userId?: string,
  ) {
    const cleanUtr = utr.trim().toUpperCase();

    if (!/^[0-9A-Z]{12}$/.test(cleanUtr)) {
      throw new BadRequestException(
        'UTR must be exactly 12 alphanumeric characters',
      );
    }

    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (userId && payment.order.userId !== userId) {
      throw new ForbiddenException('Unauthorized access to this payment');
    }

    if (payment.status === PaymentStatus.PAID) {
      throw new BadRequestException(
        'This payment has already been verified and marked as PAID',
      );
    }

    // Check UTR duplicate across other completed or submitted payments
    const duplicate = await this.prisma.payment.findFirst({
      where: {
        utr: cleanUtr,
        id: { not: paymentId },
        status: {
          in: [PaymentStatus.PAID, PaymentStatus.AWAITING_VERIFICATION],
        },
      },
    });

    if (duplicate) {
      throw new ConflictException(
        'This UTR number has already been submitted for another order. Please check your bank statement.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          utr: cleanUtr,
          screenshotUrl: screenshotUrl || payment.screenshotUrl,
          status: PaymentStatus.AWAITING_VERIFICATION,
          submittedAt: new Date(),
          rejectionReason: null,
        },
        include: {
          order: true,
        },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: PaymentStatus.AWAITING_VERIFICATION,
        },
      });

      return updatedPayment;
    });
  }

  /**
   * Admin: List payments with optional status filter
   */
  async findAll(status?: PaymentStatus) {
    return this.prisma.payment.findMany({
      where: status ? { status } : undefined,
      include: {
        order: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
              },
            },
            shippingAddress: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  /**
   * Admin: Verify payment -> Mark PAID and advance order to PROCESSING
   */
  async verifyPayment(adminId: string, paymentId: string, notes?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment record not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.PAID,
          verifiedAt: new Date(),
          verifiedById: adminId,
          rejectionReason: notes || null,
        },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          status: OrderStatus.PROCESSING,
          paymentStatus: PaymentStatus.PAID,
        },
      });

      return updatedPayment;
    });
  }

  /**
   * Admin: Reject payment with required reason -> Customer can resubmit
   */
  async rejectPayment(adminId: string, paymentId: string, reason: string) {
    if (!reason || reason.trim().length < 3) {
      throw new BadRequestException(
        'A descriptive rejection reason is required',
      );
    }

    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment record not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.REJECTED,
          rejectionReason: reason,
          verifiedById: adminId,
        },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: PaymentStatus.REJECTED,
        },
      });

      return updatedPayment;
    });
  }
}
