# Progress Log: Chand Mobile Expert Overhaul

## Status Overview
* **Status:** All Master Prompt Parts (A through J) Completed & Verified.
* **Architecture:** pnpm workspaces + Turborepo monorepo with 3 applications (`apps/api`, `apps/web`, `apps/admin`) and 6 shared packages (`packages/types`, `packages/api-client`, `packages/ui`, `packages/config-typescript`, `packages/config-eslint`, `packages/config-tailwind`).
* **Build Health:** 100% build pass rate across all packages with zero TypeScript errors.

---

## Completed Milestones

### 1. Part A: Audit & Verification (`docs/AUDIT.md`)
- [x] Initialized root git repo, branch `feat/monorepo`.
- [x] Verified all 6 Red Alerts in real codebase.
- [x] Identified and cataloged 16 critical findings (zero DB indexes, IDOR risks, insecure token decodes, missing RBAC).
- [x] Logged all architectural decisions in `docs/DECISIONS.md`.

### 2. Part B: Monorepo Restructure & Infrastructure
- [x] Migrated standalone repositories into Turborepo workspace topology:
  - `apps/api`: NestJS 11 + Prisma 7 + PostgreSQL + Firebase Admin
  - `apps/web`: Next.js 16 (App Router) + React 19 + Tailwind v4
  - `apps/admin`: Next.js 16 + React 19 + TailAdmin + Geist typography
- [x] Hoisted and shared packages:
  - `packages/config-typescript`: Base, nextjs, node, and library tsconfig bases.
  - `packages/config-eslint`: Shared ESLint configurations.
  - `packages/config-tailwind`: Tailwind v4 theme (`#a8d946` brand palette, surfaces, borders, semantic states).
  - `packages/types`: Single source of truth for Zod schemas, enums, money utils (`toPaise`, `toRupees`, `formatINR`).
  - `packages/api-client`: Standardized Axios client with JWT refresh, request-ID propagation, and typed `ApiError`.
  - `packages/ui`: Shared design primitives (`StatusPill`, `Button`, `Price`, `Card`).
- [x] Multi-stage Dockerfiles (`infra/Dockerfile.*`), `docker-compose.yml`, `.github/workflows/ci.yml`.

### 3. Part E: Critical Security & Red Alert Remediation
- [x] **Alert 1 (Product CRUD):** Implemented `POST`, `PATCH`, and `DELETE` in `products.controller.ts` & `products.service.ts` with auto-slug generation and role gating (`SUPER_ADMIN`).
- [x] **Alert 2 (Admin Bypass):** Removed `&& false` in `apps/api/src/auth/auth.service.ts`.
- [x] **Alert 3 (Backdoor Token):** Removed hardcoded test token and automatic escalation; gated test token behind `ALLOW_TEST_AUTH=true`.
- [x] **Alert 4 (Orders Data Leak):** Enforced `AuthGuard('jwt')` on order endpoints; removed the random customer fallback query that leaked private orders.
- [x] **Alert 5 (Unprotected Admin Endpoints):** Applied `@UseGuards(AuthGuard('jwt'), RolesGuard)` and `@Roles(Role.SUPER_ADMIN)` across 10 controllers (`brands`, `categories`, `sub-categories`, `devices`, `services`, `teams`, `faqs`, `testimonials`, `business-profile`, `users`).
- [x] **Alert 6 (Proxy Routes):** Deleted redundant `apps/web/app/api/*` proxy routes.

### 4. Part D: Database Schema & Prisma Optimization
- [x] Added composite indexes on `Order`, `RepairQuery`, `Product`, `OrderItem`, `CartItem`, `Wishlist`.
- [x] Added `Payment` model and `PaymentStatus` enum (`AWAITING_PAYMENT`, `AWAITING_VERIFICATION`, `PAID`, `REJECTED`, `EXPIRED`, `REFUNDED`).
- [x] Extended `BusinessProfile` with UPI VPA, payee name, QR expiry, GST number.
- [x] Re-generated Prisma Client v7.10.1 (`pnpm --filter @chand/api exec prisma generate`).

### 5. Part F: Direct UPI Dynamic QR Payment Engine
- [x] Built server-side NPCI-compliant UPI URI generator (`upi://pay?pa=...`) and dynamic SVG QR code generation (`qrcode`).
- [x] Implemented `GET /payments/instructions/:orderId` for dynamic QR display.
- [x] Implemented `POST /payments/:id/submit` for customer 12-digit UTR submission with duplicate prevention.
- [x] Implemented admin verification (`POST /payments/:id/verify`) and rejection (`POST /payments/:id/reject`).
- [x] Published owner-facing runbook in `docs/PAYMENTS.md`.

### 6. Part C & G: Customer Web UI/UX Polish
- [x] Unified color theme with `#a8d946` accent across light and dark modes.
- [x] Decomposed giant `checkout/page.tsx` (1,428 lines) into clean modular components under `apps/web/components/checkout/`:
  - `CheckoutStepsBar.tsx`
  - `AddressSelectionStep.tsx`
  - `NewAddressForm.tsx`
  - `PaymentSelectionStep.tsx` (with dynamic UPI QR and live UTR submission form)
  - `OrderSummarySidebar.tsx`
  - `OrderSuccessView.tsx` (with delivery timeline, UTR status, and WhatsApp support link)
- [x] Decomposed `Header.tsx` (558 lines) into modular subcomponents under `apps/web/components/header/`:
  - `NavLinks.tsx`
  - `ProfileDropdown.tsx`
  - `MobileDrawer.tsx`
- [x] Refactored `services/page.tsx` to call `@chand/api-client` directly without proxy fallbacks.

### 7. Part H: Complete Admin Panel Modules
- [x] Built dedicated **UPI Payments & Verification Queue** (`/payments`):
  - Filter tabs: `ALL`, `AWAITING_VERIFICATION`, `PAID`, `REJECTED`, `AWAITING_PAYMENT`.
  - Copyable 12-digit UTR references.
  - Verification modal (confirms bank statement match, updates order to `PROCESSING`).
  - Rejection modal (allows admin to specify reason so customer can re-enter valid UTR).
- [x] Extended `BusinessProfileForm.tsx` with live UPI configuration fields (`upiVpa`, `upiPayeeName`, `upiQrExpiryMinutes`, `gstNumber`).
- [x] Fixed currency notation in `ProductTable.tsx` from `$` to Indian Rupee `₹`.
- [x] Unified typography to Geist font matching the customer store.
- [x] Added `UPI Payments` and `Business & UPI Config` to admin sidebar navigation.

### 8. Part I: Documentation & Environment Templates
- [x] Created `.env.example` in `apps/api`, `apps/web`, and `apps/admin`.
- [x] Published `docs/PAYMENTS.md` (UPI verification runbook).
- [x] Published `docs/ADMIN_GUIDE.md` (Daily shop operations guide).
- [x] Verified `turbo run build` across all packages.

---

## Verification Summary

| Package | Typecheck (`tsc --noEmit`) | Production Build | Status |
|---|---|---|---|
| `@chand/types` | PASSED | PASSED | OK |
| `@chand/api-client` | PASSED | PASSED | OK |
| `@chand/ui` | PASSED | PASSED | OK |
| `@chand/api` | PASSED | PASSED (`nest build`) | OK |
| `@chand/web` | PASSED | PASSED (`next build`) | OK (20 routes) |
| `@chand/admin` | PASSED | PASSED (`next build`) | OK (36 routes) |
