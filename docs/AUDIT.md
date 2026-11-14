# Audit & Verification Report: Chand Mobile Expert

> **Date:** November 14, 2026  
> **Status:** Completed  
> **Auditor:** Principal Full-Stack Architect & Lead Senior Developer

---

## 1. Repository & Architecture Mapping (A1)

### 1.1 Repository Structure & Ports
The current codebase consists of three separate projects in the root directory:
* **`chandmobileexpert-backend`** (Target: `apps/api`): NestJS 11 + Express + Prisma 7 + PostgreSQL + Firebase Admin SDK 13. Runs on **Port 3000**.
* **`chandmobileexpert-web`** (Target: `apps/web`): Next.js 16.3.3 (React 19.2.8) + Tailwind CSS v4 + Zustand 5 + Three.js / R3F + Leaflet + Firebase 12. Runs on **Port 3001**.
* **`chandmobileexpert-admin`** (Target: `apps/admin`): Next.js 16.1.6 (React 19.2.0) + Tailwind CSS v4 + TailAdmin + ApexCharts + FullCalendar. Runs on **Port 3002**.

### 1.2 Package Managers & Scripts
* **Backend:** `npm` / `pnpm` (`build`, `start:dev`, `start:prod`, `test`, `lint`).
* **Web:** `npm` / `pnpm` (`dev -p 3001`, `build`, `start`, `lint`).
* **Admin:** `npm` / `pnpm` (`dev -p 3002`, `build`, `start`, `lint`).

### 1.3 Third-Party Services & Integrations
* **Supabase PostgreSQL:** Hosted database accessed via direct (`DIRECT_URL`, port 5432) and pooled (`DATABASE_URL`, port 6543) connections.
* **Firebase Authentication:** Client SDKs for web/admin and Firebase Admin SDK in backend for token verification.
* **OpenStreetMap / Leaflet:** Map geocoding and pin-drop address picker in customer checkout.
* **Three.js / React Three Fiber / Drei:** 3D hero rendering in customer web.

### 1.4 Database Schema Audit (18 Models in Prisma)
1. `User`: Core accounts (`USER`, `SUPER_ADMIN`, `TECHNICIAN`).
2. `Address`: Multi-address storage with default flag and shipping relations.
3. `BusinessProfile`: Singleton storing business contact details and hours.
4. `Category`: Top-level product taxonomy.
5. `SubCategory`: Nested taxonomy under Category.
6. `Product`: E-commerce catalog entity (`name`, `price`, `discountPrice`, `inStock`, etc.).
7. `RepairQuery`: Customer repair inquiries with status enum.
8. `Brand`: Smartphone brands (`Apple`, `Samsung`, etc.).
9. `Device`: Smartphone hardware models linked to Brand.
10. `Service`: Repair service catalog (`Screen Replacement`, `Battery`, etc.).
11. `DeviceServicePricing`: Pivot table linking Device and Service with custom pricing.
12. `TeamMember`: About page team profiles.
13. `Testimonial`: Customer feedback and ratings.
14. `FAQ`: Questions and answers by category.
15. `GeneralEnquiry`: Contact form queries.
16. `Order`: Customer orders (`PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
17. `OrderItem`: Line items capturing `productId`, `quantity`, `price`.
18. `Cart` & `CartItem`: Persistent shopping cart for authenticated users.
19. `Wishlist`: Saved items per user.

### 1.5 API Route Inventory (NestJS Backend)

| Controller | Method | Path | Guard | Roles Required | Status / Vulnerability |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `AppController` | `GET` | `/` | None | None | Public status ping |
| `AppController` | `GET` | `/analytics` | `JwtAuthGuard, RolesGuard` | `SUPER_ADMIN` | Protected dashboard metrics |
| `AuthController` | `POST` | `/auth/login` | None (Throttled) | None | Public user login |
| `AuthController` | `POST` | `/auth/admin/firebase-login` | None (Throttled) | None | Admin firebase exchange |
| `AuthController` | `POST` | `/auth/admin/login` | None (Throttled) | None | **CRITICAL: Role check bypassed with `&& false`** |
| `BookRepairsController` | `POST` | `/book-repairs` | None | None | Public booking submission |
| `BookRepairsController` | `GET` | `/book-repairs` | `AuthGuard('jwt'), RolesGuard` | `SUPER_ADMIN` | Protected admin list |
| `BookRepairsController` | `GET` | `/book-repairs/my-repairs` | `AuthGuard('jwt')` | Authenticated | User repairs list |
| `BookRepairsController` | `GET` | `/book-repairs/:id` | `AuthGuard('jwt')` | Authenticated | **VULN: Missing ownership check (IDOR)** |
| `BookRepairsController` | `PATCH` | `/book-repairs/:id` | `AuthGuard('jwt'), RolesGuard` | `SUPER_ADMIN` | Admin status update |
| `BookRepairsController` | `DELETE`| `/book-repairs/:id` | `AuthGuard('jwt'), RolesGuard` | `SUPER_ADMIN` | Admin deletion |
| `BrandsController` | `POST` | `/brands` | **NONE** | **NONE** | **CRITICAL: Unprotected public write** |
| `BrandsController` | `GET` | `/brands` | None | None | Public catalog read |
| `BrandsController` | `GET` | `/brands/:id` | None | None | Public catalog read |
| `BrandsController` | `PATCH` | `/brands/:id` | **NONE** | **NONE** | **CRITICAL: Unprotected public update** |
| `BrandsController` | `DELETE`| `/brands/:id` | **NONE** | **NONE** | **CRITICAL: Unprotected public delete** |
| `CategoriesController` | `POST` | `/categories` | **NONE** | **NONE** | **CRITICAL: Unprotected public write** |
| `CategoriesController` | `GET` | `/categories` | None | None | Public catalog read |
| `CategoriesController` | `GET` | `/categories/:id` | None | None | Public catalog read |
| `CategoriesController` | `PATCH` | `/categories/:id` | **NONE** | **NONE** | **CRITICAL: Unprotected public update** |
| `CategoriesController` | `DELETE`| `/categories/:id` | **NONE** | **NONE** | **CRITICAL: Unprotected public delete** |
| `SubCategoriesController` | `ALL` | `/sub-categories/*` | **NONE** | **NONE** | **CRITICAL: Unprotected public CRUD** |
| `DevicesController` | `ALL` | `/devices/*` | **NONE** | **NONE** | **CRITICAL: Unprotected public CRUD** |
| `ServicesController` | `ALL` | `/services/*` | **NONE** | **NONE** | **CRITICAL: Unprotected public CRUD** |
| `TeamsController` | `ALL` | `/teams/*` | **NONE** | **NONE** | **CRITICAL: Unprotected public CRUD** |
| `TestimonialsController` | `ALL` | `/testimonials/*` | **NONE** | **NONE** | **CRITICAL: Unprotected public CRUD** |
| `FaqsController` | `ALL` | `/faqs/*` | **NONE** | **NONE** | **CRITICAL: Unprotected public CRUD** |
| `BusinessProfileController`| `ALL` | `/business-profile/*` | **NONE** | **NONE** | **CRITICAL: Unprotected public write** |
| `GeneralEnquiriesController`| `POST` | `/general-enquiries` | None | None | Public contact form |
| `GeneralEnquiriesController`| `GET,PATCH,DELETE` | `/general-enquiries/*` | `AuthGuard('jwt'), RolesGuard` | `SUPER_ADMIN` | Protected admin management |
| `OrdersController` | `GET` | `/orders` | `AuthGuard('jwt'), RolesGuard` | `SUPER_ADMIN` | Protected admin order list |
| `OrdersController` | `GET` | `/orders/my-orders` | **NONE** | **NONE** | **CRITICAL: Insecure base64 decode + Order leak** |
| `OrdersController` | `POST` | `/orders/checkout` | **NONE** | **NONE** | **CRITICAL: Insecure base64 decode + Hardcoded dummy address** |
| `OrdersController` | `PATCH` | `/orders/:id` | `AuthGuard('jwt'), RolesGuard` | `SUPER_ADMIN` | Protected status update |
| `OrdersController` | `DELETE`| `/orders/:id` | `AuthGuard('jwt'), RolesGuard` | `SUPER_ADMIN` | Protected order deletion |
| `ProductsController` | `GET` | `/products` | None | None | Public list |
| `ProductsController` | `GET` | `/products/:idOrSlug` | None | None | Public item read |
| `ProductsController` | `POST,PATCH,DELETE`| `/products/*` | **MISSING** | **MISSING** | **CRITICAL: Endpoints do not exist in backend!** |
| `UsersController` | `GET` | `/users` | **NONE** | **NONE** | **CRITICAL: Unprotected customer data scraping** |
| `UsersController` | `GET,PATCH`| `/users/me/*` | `JwtAuthGuard` | Authenticated | Own profile and addresses |
| `UsersController` | `PATCH,DELETE`| `/users/:id` | `JwtAuthGuard` | **NONE** | **CRITICAL: Missing RolesGuard (IDOR)** |
| `CartController` | `ALL` | `/cart/*` | `AuthGuard('jwt')` | Authenticated | User cart CRUD |
| `WishlistController` | `ALL` | `/wishlist/*` | `AuthGuard('jwt')` | Authenticated | User wishlist CRUD |

---

## 2. Verification of Red Alerts (A2)

| Alert ID | Description | File & Line | Verification Status | Fix Plan |
| :--- | :--- | :--- | :--- | :--- |
| **Alert 1** | Missing Product CRUD endpoints in backend | `chandmobileexpert-backend/src/products/products.controller.ts` L1-20 | **CONFIRMED** | Add `POST /products`, `PATCH /products/:id`, `DELETE /products/:id` with Zod validation DTOs and `@UseGuards(JwtAuthGuard, RolesGuard)`. |
| **Alert 2** | `&& false` bypass in `loginAdmin` | `chandmobileexpert-backend/src/auth/auth.service.ts` L144 | **CONFIRMED** | Remove `&& false`. Replace with strict role check: `if (user.role !== 'SUPER_ADMIN') throw new UnauthorizedException('Access denied. Admins only.');` |
| **Alert 3** | Hardcoded `test-admin-token-9999999999` backdoor | `chandmobileexpert-backend/src/auth/auth.service.ts` L27-33, L77-84 | **CONFIRMED** | Remove test token bypass and hardcoded `9999999999` phone escalation. Implement strict environment flag `ALLOW_TEST_AUTH=true` that fails fast in production. |
| **Alert 4** | Unverified base64 JWT decode in orders & fallback customer data leakage | `chandmobileexpert-backend/src/orders/orders.controller.ts` L34-45, L57-68 & `orders.service.ts` L50-59 | **CONFIRMED** | Apply `@UseGuards(JwtAuthGuard)` and `@CurrentUser()`. Delete the fallback `findFirst` query that leaked random customer orders to unauthenticated users. |
| **Alert 5** | Unprotected admin endpoints (brands, categories, devices, users, etc.) | `brands.controller.ts`, `categories.controller.ts`, `devices.controller.ts`, `services.controller.ts`, `users.controller.ts` | **CONFIRMED** | Enforce global default-deny or apply `@UseGuards(JwtAuthGuard, RolesGuard)` with `@Roles(Role.SUPER_ADMIN)` to all mutation routes and user directory. |
| **Alert 6** | Dual API layer (Next.js `app/api/*` proxies vs direct Axios) & localhost fallbacks | `chandmobileexpert-web/app/api/*/route.ts` & `chandmobileexpert-web/lib/api.ts` | **CONFIRMED** | Eliminate redundant `/app/api/*` proxy routes in web. Standardize on typed `packages/api-client` directly calling `NEXT_PUBLIC_API_URL`. |

---

## 3. Additional Scanned Issues & Technical Debt (A3)

1. **Zero Database Indexes (High Severity):**
   * `schema.prisma` contains zero non-primary/unique indexes.
   * *Impact:* High latency on foreign key queries (`Order.userId`, `CartItem.cartId`, `OrderItem.orderId`, `Device.brandId`).
   * *Fix:* Add `@@index([userId])`, `@@index([status])`, `@@index([createdAt])`, `@@index([categoryId])`, `@@index([brandId])`.
2. **Missing Ownership (IDOR) Checks (High Severity):**
   * In `BookRepairsController.findOne(id)`, any authenticated user can view any repair query by guessing the UUID.
   * In `UsersController.patch(':id')` and `delete(':id')`, missing role check allows any user to alter another user.
3. **Client-Trusted Pricing & Fallback Hacks in Checkout (Critical Severity):**
   * In `orders.service.ts`, if cart is empty, it assigns fallback price `1499` or `499` and creates a dummy address for `Dev Thakur`.
   * *Fix:* Enforce server-side price computation strictly from database products, fail transaction on empty items or invalid addresses.
4. **Float / Decimal Inconsistencies:**
   * Money is stored as `Decimal(10,2)` in Prisma, but handled as JavaScript floating point `Number()` across services and frontend stores, causing rounding errors.
   * *Fix:* Centralize currency in `packages/types` as integer paise.
5. **Overselling / Stock Race Conditions:**
   * In `orders.service.ts`, stock decrement is done inside a try/catch block with no check for `stockCount >= quantity`. Stock can drop below zero.
   * *Fix:* Conditional update `where: { id, stockCount: { gte: quantity } }`.
6. **Mock Data Fallbacks Masking Backend Outages:**
   * In `chandmobileexpert-web/lib/data.ts` and `productsData.ts`, catch blocks fall back to mock data, hiding server failures during deployment.
7. **Monolithic Frontend Components:**
   * `checkout/page.tsx` is 1,428 lines, mixing multi-step wizard, map picker, UPI simulation, and invoice layout.
   * `Header.tsx` is 558 lines; `services/page.tsx` is 475 lines.

---

## 4. Design System Inventory & Inconsistencies (A4)

| Attribute | Customer Web (`chandmobileexpert-web`) | Admin Panel (`chandmobileexpert-admin`) | Target Unified Token (`packages/config-tailwind`) |
| :--- | :--- | :--- | :--- |
| **Brand Primary** | `#a8d946` (Lime Green, `--accent`) | `#a8d946` (`--color-brand-500`), but mixed with TailAdmin blue `#0ba5ec` | `--color-primary: #a8d946` + full 50-950 scale |
| **Dark Background** | `#09090b` (Zinc-950) | `#101828` / `#1a2232` (Gray/Slate) | `--color-bg: #09090b` |
| **Dark Surface / Card**| `#141416` / `#121214` | `#1e293b` (Slate-800) | `--color-surface: #141416`, `--color-surface-2: #1c1c21` |
| **Light Background** | `#ffffff` | `#ffffff` / `#f8fafc` | `--color-bg: #ffffff` |
| **Light Surface / Card**| `#f5ede4` / `#f4f4f5` | `#ffffff` / `#f1f5f9` | `--color-surface: #ffffff`, `--color-surface-2: #f4f4f5` |
| **Typography** | Geist Sans (`next/font/google`) | Outfit (`Outfit, sans-serif`) | Unified: **Geist Sans** (`--font-sans`) + **Geist Mono** (`--font-mono`) |
| **Border Colors** | `#27272a` (dark), `#e4e4e7` (light) | `#334155` (dark), `#e2e8f0` (light) | `--color-border: #27272a` (dark), `#e4e4e7` (light) |
| **Button Styles** | Rounded pill / md with ReactBits Magnet & Glow | Rectangular / sm TailAdmin buttons | Unified: Shared `Button` in `packages/ui` with variants |
| **Status Indicators** | Custom badge pills in shop & account | Ad-hoc badges in tables | Unified `StatusPill` component with centralized status map |

---

## 5. Master Findings Table (A5)

| ID | Area | Severity | Description | Exact Location | Proposed Fix | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | Backend Auth | 🔴 Critical | Role check bypassed via `&& false` in admin login | `backend/src/auth/auth.service.ts:144` | Enforce strict role check | Pending Part E |
| **SEC-02** | Backend Auth | 🔴 Critical | Hardcoded backdoor admin token & phone bypass | `backend/src/auth/auth.service.ts:27-34` | Remove backdoor, require env flag in dev | Pending Part E |
| **SEC-03** | Orders / Auth | 🔴 Critical | Insecure manual base64 token parse without verification | `backend/src/orders/orders.controller.ts:34-45` | Apply `JwtAuthGuard` & `@CurrentUser()` | Pending Part E |
| **SEC-04** | Orders / Privacy| 🔴 Critical | Fallback query leaks random customer orders | `backend/src/orders/orders.service.ts:50-59` | Delete fallback query entirely | Pending Part E |
| **SEC-05** | API Security | 🔴 Critical | Unprotected CRUD endpoints in 9 controllers | `brands`, `categories`, `devices`, `services`, etc. | Apply `JwtAuthGuard` + `RolesGuard` | Pending Part E |
| **SEC-06** | User Security | 🔴 Critical | Unprotected `GET /users` scrapes all customer PII | `backend/src/users/users.controller.ts:14` | Restrict to `SUPER_ADMIN` | Pending Part E |
| **SEC-07** | User Security | 🔴 Critical | IDOR: any user can patch or delete another user | `backend/src/users/users.controller.ts:47-55` | Restrict to self or `SUPER_ADMIN` | Pending Part E |
| **API-01** | Products | 🔴 Critical | Missing `POST`, `PATCH`, `DELETE` in backend | `backend/src/products/products.controller.ts` | Implement full CRUD & service methods | Pending Part E |
| **DAT-01** | Database | 🟠 High | Zero non-primary indexes on 18 models | `backend/prisma/schema.prisma` | Add composite indexes on FKs & status | Pending Part D |
| **DAT-02** | Checkout | 🔴 Critical | Client-trusted prices & fallback dummy data | `backend/src/orders/orders.service.ts` | Server-side pricing recalculation | Pending Part D/E |
| **DAT-03** | Inventory | 🟠 High | Stock overselling race condition | `backend/src/orders/orders.service.ts` | Atomic decrement with condition check | Pending Part D/E |
| **PAY-01** | Payments | 🔴 Critical | No UPI dynamic QR payment implementation | Whole repository | Implement Part F UPI dynamic QR engine | Pending Part F |
| **UI-01** | Design System| 🟠 High | Color & font desynchronization between web & admin | `web/app/globals.css` vs `admin/app/globals.css` | Create unified `@chand/config-tailwind` | Pending Part C |
| **UI-02** | Frontend Arch| 🟡 Medium | Monolithic `checkout/page.tsx` (1,428 lines) | `web/app/checkout/page.tsx` | Decompose into 5 modular components | Pending Part C/G |
| **UI-03** | Frontend Arch| 🟡 Medium | Redundant `app/api/*` BFF proxy routes | `web/app/api/*` | Remove and standardize on `api-client` | Pending Part B/G |
| **ADM-01** | Admin Panel | 🟠 High | Dead code & unused template bloat in TailAdmin | `admin/src/app/(admin)/(others-pages)` | Purge unused demo pages and packages | Pending Part B/H |
