# Luxian API

NestJS REST API for [Luxian](../README.md): catalog, cart, atomic checkout, inventory ledger, suppliers, staff RBAC, homepage settings, stats, and personalization.

## Stack

- NestJS 11
- Prisma 7 + PostgreSQL (`@prisma/adapter-pg`)
- JWT auth in HTTP-only cookies + CSRF on mutating routes
- bcrypt password hashing
- class-validator DTOs with global `ValidationPipe`

Base path: **`/api/v1`**

## Run locally

```bash
cd api
cp .env.example .env   # DATABASE_URL, JWT_SECRET required
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

- API: [http://localhost:3000/api/v1](http://localhost:3000/api/v1)
- Health: `GET /api/v1` returns a hello string

## Environment

Copy `api/.env.example` → `api/.env`.

| Variable | Purpose |
|----------|---------|
| `PORT` | Listen port (default `3000`) |
| `CORS_ORIGIN` | Allowed browser origin, e.g. `http://localhost:3001` |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Signing secret — change in production |
| `JWT_EXPIRATION` | Access token TTL (default `15m`) |
| `COOKIE_DOMAIN` | Optional parent domain when web + API share a site |
| `R2_*` | Optional Cloudflare R2 — see [`CLOUDFLARE_R2_SETUP.md`](CLOUDFLARE_R2_SETUP.md) |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Watch mode |
| `npm run build` | Compile to `dist/` |
| `npm run start:prod` | Run compiled app |
| `npm run db:seed` | Seed demo users, staff role presets, fashion catalog |
| `npm run db:seed:fashion` | Fashion catalog only |
| `npm run db:seed:movement` | Stock movement demo data |
| `npm run test` | Unit tests (Jest) |
| `npm run test:e2e` | E2E tests (Supertest) |

## Modules

| Module | Routes (prefix `/api/v1`) | Notes |
|--------|---------------------------|-------|
| `auth` | `/auth/*` | Register, login, logout, refresh, `GET /auth/me` |
| `categories` | `/categories` | CRUD, soft deactivate |
| `products` | `/products` | CRUD, stock, multi-image, filters |
| `collections` | `/collections` | Curated sets with ordering |
| `homepage` | `/homepage` | Singleton settings row |
| `cart` | `/cart` | Per-user cart and line items |
| `orders` | `/orders` | Checkout, list, detail, admin status |
| `payments` | `/payments` | Read payment by order (stub at checkout) |
| `stats` | `/admin/stats` | Dashboard aggregates |
| `suppliers` | `/suppliers`, `/supplier-orders` | Inbound orders → stock on receive |
| `staff` | `/staff/*` | Roles and staff users |
| `personalization` | `/personalization/*` | Visitor events, recommendations |
| `favorites` | `/favorites` | Wishlist |
| `media` | `/media` | Asset history per owner |
| `uploads` | `/uploads` | Optional R2 helpers |

Full request examples: [`POSTMAN_TESTING.md`](POSTMAN_TESTING.md).

## Auth and authorization

- Passwords hashed with bcrypt (12 rounds).
- Access + refresh JWTs stored in HTTP-only cookies; refresh rotation tracked in the database.
- Mutating requests require `X-CSRF-Token` matching the readable CSRF cookie.
- Roles: `USER`, `ADMIN`, `STAFF`.
- `ADMIN` bypasses permission checks; `STAFF` uses assigned permissions from `StaffRole`.
- Permission strings include `dashboard:read`, `products:write`, `homepage:write`, `suppliers:write`, `staff:manage`, etc. — see `src/modules/auth/permissions/permission.registry.ts`.

## Checkout (core transaction)

`POST /orders/checkout` in one Prisma `$transaction`:

1. Validates cart and stock
2. Creates order + line items (price and `costAtSale` snapshots)
3. Records stub payment (`COMPLETED`, `paymentMethod: stub`)
4. Decrements product stock
5. Writes `StockMovement` rows
6. Marks cart `checkedOut: true`

## Seed data

`npm run db:seed` creates:

- `admin@demo.com` — `ADMIN`
- `user@demo.com` — `USER`
- Staff role presets: Manager, Designer, Stock Auditor
- Demo SKUs + fashion catalog (`prisma/data/fashion-catalog.ts`)

Password for all demo users: **`Secret1!`**

## Database

```bash
npx prisma migrate dev    # apply migrations
npx prisma studio         # browse data
npx prisma generate       # regenerate client (also runs on postinstall)
```

Schema: `prisma/schema.prisma`

## Testing

```bash
npm run test        # unit
npm run test:e2e    # e2e (see test/jest-e2e.json)
```

Manual flows: [`POSTMAN_TESTING.md`](POSTMAN_TESTING.md).

## Deployment

Production API: [https://luxian.onrender.com/api/v1](https://luxian.onrender.com/api/v1)

Ensure `CORS_ORIGIN` includes the Vercel storefront URL. Cookie `Secure` / `SameSite` must match HTTPS production.

## Related docs

- [`LEARNING_REPORT.md`](LEARNING_REPORT.md) — API learning track
- [`POSTMAN_TESTING.md`](POSTMAN_TESTING.md) — manual API testing
- [`CLOUDFLARE_R2_SETUP.md`](CLOUDFLARE_R2_SETUP.md) — optional R2 uploads
- [`../README.md`](../README.md) — monorepo overview
