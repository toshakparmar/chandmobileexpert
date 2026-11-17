# 📱 Chand Mobile Expert — Enterprise Monorepo

[![Turborepo](https://img.shields.io/badge/Turborepo-v2.x-000000?style=for-the-badge&logo=turborepo&logoColor=white)](https://turbo.build)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io)
[![Supabase PostgreSQL](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![pnpm](https://img.shields.io/badge/pnpm-10-F69220?style=for-the-badge&logo=pnpm&logoColor=white)](https://pnpm.io)

> Production-ready, full-stack monorepo power-house for **Chand Mobile Expert**: a modern mobile phone repair service, certified refurbished smartphone store, and premium accessories platform based in Sambhal, Uttar Pradesh, India.

---

## 🏛 System Architecture

```mermaid
graph TD
    Client[Customer Web Browser] -->|Port 3001| WebApp["apps/web (Next.js 15)"]
    Admin[Admin Staff Browser] -->|Port 3002| AdminApp["apps/admin (Next.js 15)"]
    
    WebApp -->|HTTP / REST API| API["apps/api (NestJS 11 - Port 3000)"]
    AdminApp -->|HTTP / REST API| API
    
    API --> DB[(Supabase / PostgreSQL)]
    API --> Auth[Firebase Admin SDK & JWT]
    API --> UPI[Dynamic UPI QR Engine]

    subgraph Packages ["Shared Monorepo Packages"]
        Types["@chand/types"]
        ApiClient["@chand/api-client"]
        UI["@chand/ui"]
        Tailwind["@chand/config-tailwind"]
        TS["@chand/config-typescript"]
        ESLint["@chand/config-eslint"]
    end

    WebApp -.-> Types & ApiClient & UI & Tailwind
    AdminApp -.-> Types & ApiClient & UI & Tailwind
    API -.-> Types
```

---

## 🌟 Key Features

### 🛒 Customer Storefront (`apps/web`)
* **Instant Repair Cost Estimator:** Interactive brand and model selector with real-time pricing for screen replacement, battery renewal, camera repair, and motherboard diagnostics.
* **Online Booking Workflow:** Hassle-free appointment scheduling with instant confirmation and real-time repair status lookup.
* **Curated Catalog:** Browse certified refurbished smartphones and mobile accessories with advanced search, categorisation, and stock indicators.
* **Direct UPI QR Checkout:** Zero-fee, instant Indian UPI payments featuring dynamic QR generation with automated UTR submission and verification.
* **Customer Account Portal:** Track past repair bookings, monitor item shipments, and manage personal profile details.
* **Responsive & Adaptive:** Mobile-first, accessible interface with animated UI transitions and dark/light mode support.

### 🛡 Admin Management Console (`apps/admin`)
* **Executive Overview Dashboard:** Live KPIs covering total revenue, active repair jobs, catalog inventory, and incoming orders.
* **Catalog Inventory Engine:** Multi-level CRUD management for Categories, Sub-categories, Brands, and Products with stock tracking.
* **Repair Service Pipeline:** Track repair requests through custom states (`PENDING`, `INSPECTION`, `IN_PROGRESS`, `COMPLETED`, `DELIVERED`).
* **Order & Transaction Management:** Real-time visibility into customer checkouts, UPI reference verification, and delivery status updates.
* **Business & UPI Configuration:** Configure merchant UPI VPA IDs, store address, contact numbers, and invoice prefix templates without redeploying.
* **Team & Content Management:** Easily update customer FAQs, manage customer testimonials, and feature store technicians.
* **Unified UI Design:** Vibrant unclipped action controls (View, Edit, Delete), full module pagination, and skeleton loading screens.

### ⚙️ Core Backend API (`apps/api`)
* **Robust NestJS 11 Architecture:** Enterprise modular structure with dependency injection, DTO validation, and exception filters.
* **Prisma 7 ORM:** Fully typed database schema connected to cloud-hosted Supabase PostgreSQL with automated schema synchronization.
* **Authentication & Role-Based Access Control:** Secure user & admin authentication using Firebase Admin SDK and custom JWT guards.
* **Dynamic UPI String Generator:** Compliant UPI URI generation (`upi://pay?pa=...&pn=...&am=...&tn=...`) for QR code creation.

---

## 📦 Workspace Layout

```
chandmobileexpert/
├── apps/
│   ├── api/                 # NestJS 11 REST API + Prisma 7 + Supabase PostgreSQL
│   ├── web/                 # Next.js 15 Customer Storefront (Port 3001)
│   └── admin/               # Next.js 15 TailAdmin Executive Dashboard (Port 3002)
├── packages/
│   ├── types/               # Shared TypeScript definitions, enums, & Zod schemas
│   ├── api-client/          # Shared Axios client with JWT refresh & error handling
│   ├── ui/                  # Shared UI components (Buttons, Modals, Cards, Badges)
│   ├── config-tailwind/     # Shared Tailwind CSS design system tokens
│   ├── config-typescript/   # Strict TypeScript configuration bases
│   └── config-eslint/       # Unified ESLint configuration
├── infra/                   # Production multi-stage Dockerfiles & Nginx configs
├── docs/                    # Architecture decision records & database schemas
├── docker-compose.yml       # Local development containers
└── turbo.json               # High-performance pipeline execution definition
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
Ensure the following tools are installed on your machine:
* **Node.js**: `v20.x` or `v22.x`
* **pnpm**: `v10.x` (`npm install -g pnpm`)
* **PostgreSQL / Supabase**: Running database instance

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/toshakparmar/chandmobileexpert.git
cd chandmobileexpert

# Install all monorepo dependencies
pnpm install
```

### 3. Environment Configuration
Create `.env` files in the respective application directories:

#### Backend API (`apps/api/.env`):
```env
PORT=3000
DATABASE_URL="postgresql://user:password@host:5432/chandmobileexpert?pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:5432/chandmobileexpert"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:3001,http://localhost:3002"
```

#### Customer Web (`apps/web/.env.local`):
```env
PORT=3001
NEXT_PUBLIC_API_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="http://localhost:3001"
```

#### Admin Portal (`apps/admin/.env.local`):
```env
PORT=3002
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### 4. Database Setup
```bash
# Push schema directly to your database
pnpm --filter @chand/api exec prisma db push

# Generate Prisma Client
pnpm --filter @chand/api exec prisma generate
```

### 5. Launch Development Servers
```bash
# Run all services concurrently with Turborepo
pnpm dev
```

| Service | Local Address |
| :--- | :--- |
| **Customer Storefront** | [http://localhost:3001](http://localhost:3001) |
| **Admin Console** | [http://localhost:3002](http://localhost:3002) |
| **Backend REST API** | [http://localhost:3000](http://localhost:3000) |

---

## 📜 Monorepo Command Reference

All commands are orchestrated via [Turborepo](https://turbo.build):

| Command | Action |
| :--- | :--- |
| `pnpm dev` | Starts all apps (`web`, `admin`, `api`) in parallel with hot reloading |
| `pnpm build` | Executes cached production build across all workspaces |
| `pnpm typecheck` | Verifies TypeScript compilation across the entire monorepo with zero errors |
| `pnpm lint` | Runs ESLint analysis across all apps and packages |
| `pnpm test` | Executes unit tests across test suites |
| `pnpm --filter @chand/api exec prisma studio` | Launches Prisma Studio GUI for database exploration |
| `pnpm clean` | Purges `.turbo`, `.next`, `dist`, and cache folders |

---

## 🔒 Security & Best Practices

* **Authentication:** Stateless JSON Web Tokens (JWT) with secure HTTP headers and token invalidation on logout.
* **Input Validation:** Request payloads validated with `class-validator` / `zod` schemas.
* **Database Safety:** SQL injection prevention via Prisma ORM parameterized queries.
* **Payment Security:** Direct UPI QR generation with merchant VPA configuration and audit-trailed payment confirmations.

---

## 📄 License

This project is proprietary software developed for **Chand Mobile Expert**. All rights reserved.
