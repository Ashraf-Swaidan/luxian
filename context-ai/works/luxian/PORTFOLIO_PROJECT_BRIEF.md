# Luxian — Portfolio Project Brief

## Project name & positioning

**Luxian** — A custom fashion storefront and **operator back office** built as one learning monorepo, not a hosted e‑commerce template.

**One-line positioning:** End-to-end commerce for a branded apparel line: shoppers get a curated, editorial homepage; store staff get inventory, suppliers, profit-aware insights, and role-scoped admin tools in the same system.

**What makes this NOT “another Shopify clone”**

- **Owned stack and data model** — NestJS + PostgreSQL + Prisma; business rules (checkout = pay + stock decrement in one transaction, stock movement ledger, cost-at-sale on line items) live in the API, not in a SaaS admin.
- **Operations-first admin** — Dashboard with revenue/profit, restock signals, supplier inbound orders, and granular **staff permissions** (Manager / Designer / Stock Auditor presets), not just “add product.”
- **Merchandising as code + CMS** — Homepage hero, collections, brand mosaic, and section colors are configurable without redeploying the storefront.
- **Lightweight personalization** — Anonymous visitor events drive on-site recommendations; no third-party personalization SKU required.

---

## Real problem / who uses it

| Actor | Need | How Luxian addresses it |
|--------|------|-------------------------|
| **Shopper** (`USER`) | Discover products, save favorites, buy with confidence on stock | Catalog, product detail, cart, stub checkout, order history, favorites |
| **Store owner / admin** (`ADMIN`) | Run catalog, homepage, orders, insights, staff | Full admin hub: dashboard, products, categories, collections, homepage, orders, suppliers, staff |
| **Staff** (`STAFF` + role permissions) | Do their job without seeing everything | Permission-gated admin cards and dashboard tabs (e.g. Designer: products/media/homepage; Stock Auditor: inventory/suppliers, no insights dashboard) |
| **Portfolio visitor / mentor** | Understand a real full-stack commerce shape | Seeded demo data, local dev docs, honest stubs called out |

There is **no in-product “AI agent”** for shoppers or ops; “Ash AI” on the portfolio site is external context only.

---

## Core capabilities (business language)

- Editorial **homepage** driven by collections, hero copy, imagery, and section color tokens.
- **Product catalog** with categories, collections, multi-image products, and active/inactive lifecycle.
- **Shopping cart** tied to logged-in users; checkout validates stock and completes in one step.
- **Order management** for customers (history, detail, payment status) and admins (status updates, fulfillment pipeline).
- **Stub payments** recorded with orders (no live card processor) so order and inventory state stay consistent.
- **Inventory discipline** — stock decrements on sale; **stock movement** history for customer orders and supplier receipts; restock limits on products.
- **Supplier orders** — inbound PO-style flows (on the way → received) that increase stock when received.
- **Operations dashboard** — today/month revenue and profit, order pipeline, products needing restock, open supplier orders, ranked product/customer views (seed/demo data only).
- **Staff & permissions** — custom roles, permission matrix, staff user management.
- **Visitor personalization** — anonymous visitor ID, event capture (search, views, filters), product recommendations on detail pages.
- **Media** — product/category/homepage images via UploadThing from the Next app; optional Cloudflare R2 path documented on API, not required.

---

## Architecture summary (internal / AI use only)

| Layer | Technology |
|--------|------------|
| API | NestJS 11, modular domains (`auth`, `products`, `cart`, `orders`, `payments`, `categories`, `collections`, `homepage`, `stats`, `suppliers`, `staff`, `personalization`, `favorites`, `media`, `uploads`) |
| Data | PostgreSQL via Prisma 7 (adapter-pg); migrations in `api/prisma/migrations` |
| Storefront | Next.js App Router, TypeScript, Tailwind, shadcn/ui, TanStack Query, React Hook Form + Zod |
| Auth transport | HTTP-only JWT cookies + CSRF on mutating API calls; user profile cached in `localStorage` for UI bootstrap |
| Dev ports | API `http://localhost:3000/api/v1`, web `http://localhost:3001` |

---

## Notable engineering decisions

| Area | Decision |
|------|----------|
| **Checkout** | `POST /orders/checkout` creates order, line items, **stub payment**, stock decrement, and `StockMovement` rows in a **single Prisma `$transaction`**; cart marked `checkedOut`; no unpaid orders sitting in `PENDING`. |
| **Auth** | bcrypt passwords; access + refresh JWTs; refresh rotation stored hashed in DB; cookie-based session for browser; `GET /auth/me` for bootstrap. |
| **Authorization** | `ADMIN` / `USER` / `STAFF` enum plus `StaffRole` + permission strings; `PermissionsGuard` on admin API routes; UI hides sections without permission. |
| **Payments** | Stub only (`paymentMethod: stub`, synthetic `transactionId`); **no Stripe** — documented gap. |
| **Homepage** | Singleton `HomepageSettings` row wires collections + hero/banner/mosaic assets + hex color overrides; Next.js server fetch + cache revalidation hook. |
| **Personalization** | `VisitorEvent` table + scoring in API; stable `luxian_visitor_id` in browser storage; recommendations on product detail when affinity exists. |
| **Uploads** | UploadThing routes in Next (`web/app/api/uploadthing`); API stores URLs only. |
| **Stats** | Profit uses `cost` / `costAtSale`; dashboard aggregates are **real relative to DB contents**, not production business metrics. |

---

## Honest scope limits

- **Learning monorepo** — README and `LEARNING_REPORT.md` / `FRONTEND_LEARNING_REPORT.md` frame this as an educational build; not positioned as production retail.
- **No public deploy URL** in repo — demo is **local** (`npm run dev` in `api/` and `web/`). Do not imply a live store URL unless one is added later.
- **Payments** — Stub only; no Stripe UI or webhooks.
- **E2E tests** — API e2e phase skipped per learning report.
- **Optional R2** — Documented (`api/CLOUDFLARE_R2_SETUP.md`) but not required for core flows.
- **Seed data** — Mix of generic demo SKUs (phone, headphones) and **Luxian fashion catalog** seed; dashboard numbers reflect DB seed, not real revenue.
- **WIP in working tree** — Homepage hex color fields may be mid-migration; verify migrations applied before capture.
- **No invented metrics** — Do not quote user counts, revenue, uptime, or performance benchmarks for portfolio copy.

---

## Privacy & demo safety

**Keep private / out of screenshots**

- `.env`, `DATABASE_URL`, `JWT_SECRET`, UploadThing keys, any R2 credentials.
- Real customer PII — use seeded accounts only: `user@demo.com`, `admin@demo.com` (password `Secret1!` per README).
- Production database URLs (e.g. Neon) if used locally.

**Safe for capture**

- Seeded fashion product names, Unsplash-style seed image URLs, demo order numbers, local host URLs.

---

## Suggested carousel description (max ~2 sentences)

Custom fashion storefront and staff back office in one codebase: shoppers browse a merchandised homepage and checkout with real inventory rules; operators manage catalog, suppliers, and profit-aware insights behind permission-scoped admin tools.

---

## Resume bullets (first person, realistic)

- Built **Luxian**, a full-stack fashion e-commerce monorepo (NestJS, PostgreSQL/Prisma, Next.js) with a shopper storefront and permission-scoped admin back office.
- Implemented **atomic checkout** that creates orders, records stub payments, decrements stock, and writes stock-movement audit rows in a single database transaction.
- Designed **staff RBAC** with preset roles (Manager, Designer, Stock Auditor) and API/UI guards so operators only see modules they are allowed to use.
- Delivered **homepage merchandising** (collections, hero, brand mosaic, configurable section colors) served from API settings and rendered on the Next storefront.
- Added **supplier inbound orders** and stock receiving flows linked to inventory movements and restock signals on the operations dashboard.
- Shipped **visitor-event personalization** (anonymous ID, affinity scoring) to power product recommendations without a third-party engine.
- Integrated **UploadThing** image uploads from the admin UI while keeping product media URLs authoritative in the API.

---

## Visually strongest screens (for portfolio art direction)

1. **Storefront homepage** (`/`) — hero, latest grid, banner, trending, brand mosaic, collection pair.
2. **Product detail** (`/products/[id]`) — gallery, favorites, recommendations strip.
3. **Admin dashboard** (`/admin/dashboard`) — insights tabs (revenue/profit, orders, products).
4. **Admin homepage editor** (`/admin/homepage`) — merchandising + color controls.
5. **Checkout → order detail** (`/checkout`, `/account/orders/[id]`) — end-to-end purchase proof.
