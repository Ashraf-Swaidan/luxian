# Luxian storefront

Next.js App Router storefront for [Luxian](../README.md): editorial homepage, catalog, cart, checkout, account, and permission-scoped admin.

## Stack

- Next.js 16 (App Router, Turbopack in dev)
- React 19, TypeScript
- Tailwind CSS 4, shadcn/ui
- TanStack Query — server state (cart, catalog, admin panels)
- React Hook Form + Zod — forms
- UploadThing — admin image uploads
- Cookie-based auth against the Nest API (`credentials: "include"`, CSRF on mutations)

## Run locally

From repo root, start the API first (see [`../README.md`](../README.md)), then:

```bash
cd web
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

## Environment

Copy `web/.env.example` → `web/.env.local`.

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Browser API base. Local direct: `http://localhost:3000/api/v1`. With proxy: `http://localhost:3001/api/v1` |
| `API_UPSTREAM` | Nest origin for Next rewrites (no `/api/v1` suffix). e.g. `http://localhost:3000` or `https://luxian.onrender.com` |
| `API_INTERNAL_URL` | Server-side API calls when using the proxy, e.g. `http://localhost:3000/api/v1` |
| `UPLOADTHING_TOKEN` | Required for admin image uploads — see [`UPLOADTHING_SETUP.md`](UPLOADTHING_SETUP.md) |
| `NEXT_PUBLIC_IMAGE_HOST` | Optional R2 public hostname |

Restart the dev server after changing env vars.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on port **3001** (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Production server on port **3001** |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |

## Routes

### Shopper

| Route | Page |
|-------|------|
| `/` | Homepage (server-fetched bundle: collections, hero, mosaic) |
| `/products` | Catalog |
| `/products/[id]` | Product detail + recommendations |
| `/cart` | Cart |
| `/checkout` | Checkout |
| `/account/profile` | Profile, favorites |
| `/account/orders` | Order list |
| `/account/orders/[id]` | Order detail |
| `/login`, `/register` | Auth |

### Admin

Guarded by `RequireAdmin` — `ADMIN` role or `STAFF` with at least one permission. Individual sections check granular permissions.

| Route | Page |
|-------|------|
| `/admin` | Hub |
| `/admin/dashboard` | Insights tabs |
| `/admin/categories` | Categories |
| `/admin/collections` | Collections |
| `/admin/products` | Product list |
| `/admin/products/[id]` | Product editor |
| `/admin/homepage` | Homepage merchandising |
| `/admin/orders` | Orders |
| `/admin/suppliers` | Suppliers |
| `/admin/staff` | Staff and roles |

## Project layout

```
web/
├── app/                  # App Router pages and layouts
├── components/           # UI and feature components
│   ├── admin/            # Admin panels
│   ├── auth/             # Login, register, guards
│   ├── layout/           # Header, footer, homepage sections
│   └── products/         # Catalog, detail, recommendations
├── features/             # Domain helpers (e.g. homepage server fetch)
├── lib/                  # api-client, permissions, query-keys, types
├── providers/            # Auth and Query providers
└── app/api/uploadthing/  # UploadThing route handlers
```

## Key patterns

- **`lib/api-client.ts`** — fetch wrapper; sends cookies and `X-CSRF-Token` on mutating requests
- **`lib/query-keys.ts`** — TanStack Query key factory
- **`providers/auth-provider.tsx`** — session bootstrap via `GET /auth/me`
- **`features/homepage/server.ts`** — cached homepage bundle for `/`
- **`next.config.mjs`** — `/api/v1` rewrite to `API_UPSTREAM`; remote image patterns for UploadThing

## Demo login

After API seed: `admin@demo.com` / `Secret1!` (admin) or `user@demo.com` / `Secret1!` (shopper).

## Related docs

- [`UPLOADTHING_SETUP.md`](UPLOADTHING_SETUP.md) — image upload setup
- [`../README.md`](../README.md) — monorepo overview
- [`../FRONTEND_LEARNING_REPORT.md`](../FRONTEND_LEARNING_REPORT.md) — frontend learning track
