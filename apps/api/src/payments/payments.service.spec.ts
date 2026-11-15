import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus, OrderStatus } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PaymentsService', () => {
  let service: PaymentsService;

  const mockOrder = {
    id: 'ord-12345678',
    orderNumber: 'CME-ORD-001',
    userId: 'usr-123',
    totalAmount: 4999.0,
    status: OrderStatus.PENDING,
    payment: null,
  };

  const mockBusinessProfile = {
    id: 1,
    companyName: 'Chand Mobile Expert',
    upiVpa: 'chand@upi',
    upiPayeeName: 'Chand Mobile Expert',
    upiQrExpiryMinutes: 20,
    upiEnabled: true,
  };

  const mockPayment = {
    id: 'pay-123',
    orderId: 'ord-12345678',
    method: 'UPI',
    status: PaymentStatus.AWAITING_PAYMENT,
    amount: 4999.0,
    upiVpa: 'chand@upi',
    upiReference: 'TR-REF-1',
    expiresAt: new Date(Date.now() + 20 * 60 * 1000),
  };

  const mockPrismaService = {
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    businessProfile: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    payment: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPaymentInstructions', () => {
    it('generates standard NPCI UPI URI with amount and payee', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.businessProfile.findFirst.mockResolvedValue(mockBusinessProfile);
      mockPrismaService.payment.create.mockResolvedValue(mockPayment);

      const instructions = await service.getPaymentInstructions(mockOrder.id, mockOrder.userId);

      expect(instructions).toBeDefined();
      expect(instructions.amount).toBe(4999.0);
      expect(instructions.upiVpa).toBe('chand@upi');
      expect(instructions.upiUri).toContain('upi://pay?pa=chand%40upi');
      expect(instructions.upiUri).toContain('am=4999.00');
      expect(instructions.upiUri).toContain('cu=INR');
      expect(instructions.qrCodeDataUrl).toMatch(/^data:image\/png;base64,/);
    });

    it('throws NotFoundException if order does not exist', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(service.getPaymentInstructions('invalid-order')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('submitUtr', () => {
    it('validates 12-digit UTR and sets status to AWAITING_VERIFICATION', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue({
        ...mockPayment,
        order: mockOrder,
      });
      mockPrismaService.payment.findFirst.mockResolvedValue(null);
      mockPrismaService.payment.update.mockResolvedValue({
        ...mockPayment,
        utr: '123456789012',
        status: PaymentStatus.AWAITING_VERIFICATION,
      });

      const result = await service.submitUtr(mockPayment.id, '123456789012', mockOrder.userId);

      expect(result.status).toBe(PaymentStatus.AWAITING_VERIFICATION);
      expect(result.utr).toBe('123456789012');
    });

    it('rejects invalid UTR length', async () => {
      await expect(
        service.submitUtr(mockPayment.id, '12345', mockOrder.userId),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
