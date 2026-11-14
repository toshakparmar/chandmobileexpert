# Architectural Decision Records (ADRs): Chand Mobile Expert

## ADR-001: Monorepo Architecture with pnpm Workspaces & Turborepo
* **Context:** Three separate projects (`chandmobileexpert-backend`, `chandmobileexpert-web`, `chandmobileexpert-admin`) suffered from schema desynchronization, duplicate types, duplicate config, and separate lockfiles.
* **Decision:** Consolidate into a unified monorepo powered by `pnpm` workspaces and `Turborepo` under `apps/` (`api`, `web`, `admin`) and `packages/` (`types`, `api-client`, `ui`, `config-typescript`, `config-eslint`, `config-tailwind`).
* **Alternatives Considered:** Nx, Lerna, independent multi-repo.
* **Reason:** Turborepo with pnpm offers maximum speed, zero-overhead caching, lightweight mental model, and native TypeScript project references.

## ADR-002: Primary Brand Palette & Design Tokens
* **Context:** Customer website used `--accent: #a8d946` (Lime) on dark `#09090b` and light `#ffffff` with Geist font, while Admin used Outfit font and remnants of TailAdmin blue `#0ba5ec`.
* **Decision:** The customer website's vibrant lime palette (`#a8d946`) and Geist typography are selected as the single source of truth for the entire brand identity. Admin is being fully re-skinned to match.
* **Alternatives Considered:** Retain separate admin styling or switch both to standard blue.
* **Reason:** Brand consistency is essential for customer trust, and the shop owner requested an identical, premium visual identity across both interfaces.

## ADR-003: Removal of Next.js App Router BFF Proxy Routes
* **Context:** `chandmobileexpert-web/app/api/*` proxied requests to `localhost:3000` or `127.0.0.1:3000`, causing double latency, deployment failures on distributed hosting (Vercel + cloud backend), and hardcoded fallback complexity.
* **Decision:** Remove all non-secret proxy routes in `apps/web/app/api/*` and use the shared `@chand/api-client` directly communicating with `NEXT_PUBLIC_API_URL`.
* **Alternatives Considered:** Maintain Next.js route proxies.
* **Reason:** Decreases latency, simplifies tracing, eliminates IPv4/IPv6 localhost binding bugs on Windows and Linux containers.

## ADR-004: Manual Verification Flow for UPI Dynamic QR Payments
* **Context:** The client operates without a third-party payment gateway (Razorpay/Cashfree/Paytm) to avoid merchant transaction fees.
* **Decision:** Generate standard `upi://pay` dynamic intent URLs and QR codes on the backend using the shop owner's configured VPA (`UPI_VPA`) and server-calculated order amount in paise. Customers submit their 12-digit UTR and optional screenshot for human verification by the admin before the order moves to `PROCESSING`.
* **Alternatives Considered:** Gateway integration or simulated instant confirmation.
* **Reason:** Truth in advertising. Without a merchant webhook API, automated bank reconciliation is impossible on personal VPAs. Clear messaging and UTR duplicate detection ensure fraud mitigation.
