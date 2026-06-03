# Luxian

Custom fashion e-commerce monorepo: a Next.js storefront and a NestJS API with catalog, checkout, inventory, suppliers, staff permissions, homepage merchandising, and lightweight personalization.

Built as a portfolio / learning project — not a hosted store template. Payments are stubbed; the live deploy is a demo sandbox.

## Live demo

| Layer | URL |
|-------|-----|
| Storefront | [https://luxian-three.vercel.app/](https://luxian-three.vercel.app/) |
| API | [https://luxian.onrender.com/api/v1](https://luxian.onrender.com/api/v1) |

Production uses a Next.js rewrite (`API_UPSTREAM`) so the browser calls `/api/v1` on the Vercel host while Nest runs on Render.

## Structure

| Path | Stack | Port (dev) |
|------|--------|------------|
| `api/` | NestJS 11, Prisma 7, PostgreSQL | **3000** |
| `web/` | Next.js 16 (App Router), Tailwind 4, shadcn/ui, TanStack Query | **3001** |

## Run locally

Use **two terminals** — API first, then web.

### 1. API

```bash
cd api
cp .env.example .env   # set DATABASE_URL, JWT_SECRET
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

- Base URL: `http://localhost:3000/api/v1`
- Health check: `GET http://localhost:3000/api/v1`
- CORS allows `http://localhost:3001` (see `CORS_ORIGIN` in `api/.env.example`)

### 2. Web storefront

```bash
cd web
cp .env.example .env.local
npm install
npm run dev
```

- Storefront: `http://localhost:3001`

**Local API URL** — pick one setup in `web/.env.local`:

| Mode | `NEXT_PUBLIC_API_URL` | Also set |
|------|------------------------|----------|
| Direct to local Nest | `http://localhost:3000/api/v1` | — |
| Proxy via Next (matches production) | `http://localhost:3001/api/v1` | `API_UPSTREAM=http://localhost:3000` |

Server-side calls (UploadThing auth, cache revalidation) use `API_INTERNAL_URL` when the browser goes through the proxy.

## Demo accounts (after seed)

| Email | Password | Role |
|-------|----------|------|
| `user@demo.com` | `Secret1!` | Shopper |
| `admin@demo.com` | `Secret1!` | Full admin |

Seed also creates **staff role presets** (Manager, Designer, Stock Auditor). Create staff users from **Admin → Staff** (`/admin/staff`).

## Storefront routes

| Route | Description |
|-------|-------------|
| `/` | Editorial homepage (collections, hero, trending, brand mosaic) |
| `/products` | Catalog |
| `/products/[id]` | Product detail, favorites, recommendations |
| `/login`, `/register` | Auth |
| `/cart` | Cart (login required) |
| `/checkout` | Place order (stub payment) |
| `/account/profile` | Profile and favorites |
| `/account/orders` | Order history |
| `/account/orders/[id]` | Order detail |

## Admin routes

Access requires `ADMIN` or `STAFF` with permissions. Sections are hidden when the user lacks the matching capability.

| Route | Description |
|-------|-------------|
| `/admin` | Admin hub (permission-filtered cards) |
| `/admin/dashboard` | Revenue, profit, orders, products, customers, suppliers |
| `/admin/categories` | Category CRUD |
| `/admin/collections` | Collection merchandising |
| `/admin/products` | Product CRUD, images, stock |
| `/admin/homepage` | Hero, banner, mosaic, section colors |
| `/admin/orders` | Order list and status updates |
| `/admin/suppliers` | Suppliers and inbound orders |
| `/admin/staff` | Staff users and roles |

## API modules

| Module | Responsibility |
|--------|----------------|
| `auth` | Register, login, logout, refresh; JWT cookies; CSRF |
| `categories` | Category CRUD |
| `products` | Product CRUD, stock, images, list filters |
| `collections` | Curated product sets |
| `homepage` | Singleton homepage settings |
| `cart` | Per-user cart |
| `orders` | Checkout (atomic transaction), order management |
| `payments` | Stub payment record per order |
| `stats` | Admin dashboard aggregates |
| `suppliers` | Suppliers and supplier orders → stock on receive |
| `staff` | Staff roles and permission assignments |
| `personalization` | Visitor events and recommendations |
| `favorites` | Wishlist |
| `media` | Media asset history |
| `uploads` | Optional R2 upload helpers |

See [`api/README.md`](api/README.md) and [`api/POSTMAN_TESTING.md`](api/POSTMAN_TESTING.md) for endpoint details.

## Image uploads

Admin images upload via **UploadThing** from the Next.js app; the API stores URLs only. See [`web/UPLOADTHING_SETUP.md`](web/UPLOADTHING_SETUP.md).

Optional **Cloudflare R2** via the API is documented in [`api/CLOUDFLARE_R2_SETUP.md`](api/CLOUDFLARE_R2_SETUP.md) but not required.

## Known gaps

- Payments are stubbed (no Stripe)
- No email notifications or shipping carrier integration
- Production API on Render may cold-start after idle
- Treat the live deploy as demo-only — rotate secrets and disable shared admin if you fork for real use

## Docs

| Doc | Description |
|-----|-------------|
| [`web/README.md`](web/README.md) | Storefront setup and structure |
| [`api/README.md`](api/README.md) | API setup, modules, auth |
| [`api/LEARNING_REPORT.md`](api/LEARNING_REPORT.md) | API learning track |
| [`FRONTEND_LEARNING_REPORT.md`](FRONTEND_LEARNING_REPORT.md) | Frontend learning track |
| [`api/POSTMAN_TESTING.md`](api/POSTMAN_TESTING.md) | Manual API testing |
| [`api/CLOUDFLARE_R2_SETUP.md`](api/CLOUDFLARE_R2_SETUP.md) | Optional R2 setup |
