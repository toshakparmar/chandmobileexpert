import { z } from "zod";

// =============================================================================
// 1. DOMAIN ENUMS
// =============================================================================

export enum Role {
  USER = "USER",
  TECHNICIAN = "TECHNICIAN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export enum PaymentMethod {
  UPI = "UPI",
  COD = "COD",
  CARD = "CARD",
  TEST = "TEST",
}

export enum PaymentStatus {
  AWAITING_PAYMENT = "AWAITING_PAYMENT",
  AWAITING_VERIFICATION = "AWAITING_VERIFICATION",
  PAID = "PAID",
  REJECTED = "REJECTED",
  EXPIRED = "EXPIRED",
  REFUNDED = "REFUNDED",
}

export enum RepairStatus {
  PENDING = "PENDING",
  REVIEWING = "REVIEWING",
  APPROVED = "APPROVED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum ProductCondition {
  BRAND_NEW = "BRAND_NEW",
  LIKE_NEW = "LIKE_NEW",
  EXCELLENT = "EXCELLENT",
  GOOD = "GOOD",
}

export enum AddressType {
  SHIPPING = "SHIPPING",
  BILLING = "BILLING",
}

// =============================================================================
// 2. MONEY UTILITIES (Stored in Paise, displayed in INR)
// =============================================================================

export const money = {
  toPaise: (rupees: number): number => Math.round(rupees * 100),
  toRupees: (paise: number): number => paise / 100,
  formatINR: (amount: number, isPaise: boolean = false): string => {
    const rupees = isPaise ? amount / 100 : amount;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(rupees);
  },
};

// =============================================================================
// 3. COMMON API ENVELOPES & ERROR SHAPES
// =============================================================================

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiErrorShape {
  statusCode: number;
  error: string;
  message: string | string[];
  details?: Record<string, any>;
  requestId?: string;
  timestamp: string;
  path: string;
}

// =============================================================================
// 4. AUTHENTICATION SCHEMAS
// =============================================================================

export const LoginSchema = z.object({
  idToken: z.string().min(1, "Firebase ID Token is required"),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const AdminLoginSchema = z.object({
  phone: z.string().regex(/^(\+91[\s-]?)?[0-9]{10}$/, "Invalid phone number format"),
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
});
export type AdminLoginInput = z.infer<typeof AdminLoginSchema>;

export interface AuthSessionResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    firstName: string | null;
    lastName: string | null;
    role: Role;
    isActive: boolean;
    profilePicture?: string | null;
  };
}

// =============================================================================
// 5. PRODUCT & CATALOG SCHEMAS
// =============================================================================

export const CreateProductSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  slug: z.string().min(2).optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be greater than zero"),
  discountPrice: z.number().positive().optional().nullable(),
  image: z.string().url("Valid image URL required").optional().nullable(),
  images: z.array(z.string().url()).optional().default([]),
  sku: z.string().optional().nullable(),
  brandId: z.string().uuid().optional().nullable(),
  categoryId: z.string().uuid("Category ID must be a valid UUID"),
  subCategoryId: z.string().uuid().optional().nullable(),
  condition: z.nativeEnum(ProductCondition).default(ProductCondition.LIKE_NEW),
  stockCount: z.number().int().nonnegative().default(1),
  inStock: z.boolean().default(true),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});
export type CreateProductInput = z.infer<typeof CreateProductSchema>;

export const UpdateProductSchema = CreateProductSchema.partial();
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;

// =============================================================================
// 6. ORDER & CHECKOUT SCHEMAS
// =============================================================================

export const AddressInputSchema = z.object({
  name: z.string().min(2).optional().nullable(),
  phone: z.string().min(10).optional().nullable(),
  tag: z.enum(["HOME", "WORK", "OTHER"]).default("HOME"),
  street: z.string().min(5, "Street address must be at least 5 characters"),
  landmark: z.string().optional().nullable(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().regex(/^[1-9][0-9]{5}$/, "Invalid 6-digit Indian PIN code"),
  country: z.string().default("IN"),
});
export type AddressInput = z.infer<typeof AddressInputSchema>;

export const CheckoutOrderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export const CheckoutDtoSchema = z.object({
  userId: z.string().uuid().optional(),
  shippingAddressId: z.string().uuid().optional(),
  billingAddressId: z.string().uuid().optional(),
  newShippingAddress: AddressInputSchema.optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.UPI),
  items: z.array(CheckoutOrderItemSchema).optional(),
  userName: z.string().optional(),
  userPhone: z.string().optional(),
  notes: z.string().max(500).optional(),
});
export type CheckoutDto = z.infer<typeof CheckoutDtoSchema>;

// =============================================================================
// 7. UPI & PAYMENT SCHEMAS
// =============================================================================

export const SubmitUtrSchema = z.object({
  utr: z.string().regex(/^[0-9A-Za-z]{12}$/, "UTR must be exactly 12 alphanumeric characters"),
  screenshotUrl: z.string().url().optional().nullable(),
});
export type SubmitUtrInput = z.infer<typeof SubmitUtrSchema>;

export const VerifyPaymentSchema = z.object({
  notes: z.string().max(300).optional(),
});
export type VerifyPaymentInput = z.infer<typeof VerifyPaymentSchema>;

export const RejectPaymentSchema = z.object({
  reason: z.string().min(3, "Rejection reason is required (minimum 3 characters)"),
});
export type RejectPaymentInput = z.infer<typeof RejectPaymentSchema>;

// =============================================================================
// 8. REPAIR QUERY SCHEMAS
// =============================================================================

export const CreateRepairQuerySchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerPhone: z.string().regex(/^(\+91[\s-]?)?[0-9]{10}$/, "Valid 10-digit phone number is required"),
  deviceModel: z.string().min(2, "Device model is required"),
  issueDesc: z.string().min(5, "Issue description is required"),
  brandId: z.string().uuid().optional(),
  deviceId: z.string().uuid().optional(),
  serviceId: z.string().uuid().optional(),
  pickupRequired: z.boolean().default(false),
  preferredSlot: z.string().optional(),
});
export type CreateRepairQueryInput = z.infer<typeof CreateRepairQuerySchema>;

export const UpdateRepairQuerySchema = z.object({
  status: z.nativeEnum(RepairStatus).optional(),
  adminNotes: z.string().optional(),
  technicianNotes: z.string().optional(),
  assignedToId: z.string().uuid().optional().nullable(),
  finalPrice: z.number().nonnegative().optional(),
});
export type UpdateRepairQueryInput = z.infer<typeof UpdateRepairQuerySchema>;

