# Luxian

Learning monorepo: NestJS API + Next.js storefront.

## Structure

| Path | Stack | Port (dev) |
|------|--------|------------|
| `api/` | NestJS, Prisma, PostgreSQL | **3000** |
| `web/` | Next.js (App Router), Tailwind, shadcn/ui | **3001** |

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
- CORS allows `http://localhost:3001` (see `CORS_ORIGIN` in `api/.env.example`)

### 2. Web storefront

```bash
cd web
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
npm install
npm run dev
```

- Storefront: `http://localhost:3001`

## Demo accounts (after seed)

| Email | Password | Role |
|-------|----------|------|
| `user@demo.com` | `Secret1!` | Shopper |
| `admin@demo.com` | `Secret1!` | Admin (catalog CRUD at `/admin`) |

## Storefront routes

| Route | Description |
|-------|-------------|
| `/` | Home + featured products |
| `/products` | Shop catalog |
| `/products/[id]` | Product detail |
| `/login`, `/register` | Auth |
| `/cart` | Cart (login required) |
| `/checkout` | Place order (stub payment) |
| `/account/orders` | Order history |
| `/account/orders/[id]` | Order detail |
| `/admin` | Admin dashboard (ADMIN only) |

## Docs

- [`api/LEARNING_REPORT.md`](api/LEARNING_REPORT.md) — API learning track (complete)
- [`FRONTEND_LEARNING_REPORT.md`](FRONTEND_LEARNING_REPORT.md) — Frontend learning track
- [`api/POSTMAN_TESTING.md`](api/POSTMAN_TESTING.md) — Manual API testing

## Frontend scaffold (one-time)

If `web/` is missing, from repo root:

```bash
npx shadcn@latest init --preset b1G2AXDzm --template next --pointer --no-monorepo -n web -y
```

Remove nested git if created: `Remove-Item -Recurse -Force web\.git` (PowerShell).
