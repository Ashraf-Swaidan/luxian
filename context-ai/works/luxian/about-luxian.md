# About Luxian (Ash AI retrieval)

Deep reference for portfolio Q&A. Tone: factual, no performance or revenue claims.

---

## What Luxian is

Luxian is a **learning monorepo** that implements a boutique **fashion e-commerce** experience: a public Next.js storefront and a NestJS API that powers catalog, commerce, operations, and light personalization. It is intentionally **not** Shopify, Medusa, or a no-code store — the value is a **custom domain model** (stock movements, supplier receipts, staff permissions, homepage settings) wired through explicit API modules.

Brand voice in UI copy defaults to **sculptural streetwear / tropical fashion** (see seed catalog in `api/prisma/data/fashion-catalog.ts`).

---

## Module map (API)

| Module | Responsibility |
|--------|----------------|
| `auth` | Register, login, logout, refresh; JWT in cookies; CSRF token; `GET /auth/me`; bcrypt |
| `categories` | CRUD, soft deactivate, slug |
| `products` | CRUD, stock, cost, SKU, multi-image, list filters, sanitization for public context |
| `collections` | Curated product sets with ordering |
| `homepage` | Singleton settings: collection slots, hero/banner/mosaic fields, hex colors |
| `cart` | Per-user cart, line items, mutations |
| `orders` | Checkout transaction, user order list/detail, admin list/status update |
| `payments` | Read payment by order; created during checkout (stub) |
| `stats` | Admin dashboard aggregates, rankings, sales series |
| `suppliers` | Suppliers, supplier orders (on the way / received / cancelled), receiving updates stock |
| `staff` | Staff users, roles, permission assignments |
| `personalization` | Record `VisitorEvent`, compute recommendations |
| `favorites` | Logged-in wishlist per product |
| `media` | Media asset history per owner (product, category, collection, homepage) |
| `uploads` | Optional direct upload helpers (R2 path documented separately) |

---

## Storefront flows (web)

### Shopper journey

1. **Browse** — `/`, `/products`; homepage loads `getCachedHomepageBundle()` (collections + hero settings).
2. **Discover product** — `/products/[id]`; may emit visitor events; shows recommendations when affinity exists.
3. **Authenticate** — `/login`, `/register`; session via API cookies; user object cached for UI.
4. **Cart** — `/cart` (requires login); TanStack Query mutations.
5. **Checkout** — `/checkout` calls `POST /orders/checkout`; on success cart cleared server-side (`checkedOut`).
6. **Account** — `/account/orders`, `/account/orders/[id]`, `/account/profile` (includes favorites preview).

### Admin journey

1. **Hub** — `/admin` shows cards filtered by `hasPermission`.
2. **Dashboard** — `/admin/dashboard` tabs: Home, Sales, Orders, Products, Customers, Suppliers (tab visibility permission-gated).
3. **Catalog** — `/admin/categories`, `/admin/collections`, `/admin/products`, `/admin/products/[id]`.
4. **Merchandising** — `/admin/homepage`.
5. **Fulfillment** — `/admin/orders`.
6. **Supply chain** — `/admin/suppliers`.
7. **People** — `/admin/staff` (`STAFF_MANAGE`).

---

## Glossary

| Term | Meaning in Luxian |
|------|-------------------|
| **Order** | Customer purchase record (`orderNumber`, `status`, `totalAmount`, line items). Created at checkout, not while browsing. |
| **Order status** | `PENDING` → `PROCESSING` → `SHIPPED` → `DELIVERED` or `CANCELLED`. Checkout sets `PROCESSING` immediately with stub pay. |
| **Cart** | Draft basket per user. `checkedOut: true` after successful checkout; new cart created on next add. |
| **Payment** | One-to-one with order. Stub flow sets `COMPLETED` and `paymentMethod: stub` in same transaction as order. |
| **Stock movement** | Immutable ledger row: `CUSTOMER_ORDER` (negative delta), `SUPPLIER_RECEIVED`, `ORDER_RESTOCK`. Ties to product and optionally order or supplier order. |
| **Supplier order** | Inbound shipment from vendor; status `ON_THE_WAY` → `RECEIVED` increases product stock. |
| **Restock limit** | Product field; dashboard “needs restock” when `stock <= restockLimit`. |
| **Collection** | Named set of products with positions; used for homepage sections and merchandising. |
| **Homepage settings** | Single row `id: homepage` linking collection IDs + hero/banner/mosaic URLs and color hex fields. |
| **Visitor / visitorId** | Anonymous browser ID (`luxian_visitor_id` in localStorage) for event tracking without login. |
| **Visitor event** | `SEARCH`, `PRODUCT_CLICK`, `PRODUCT_VIEW`, `CATEGORY_FILTER`, `COLLECTION_FILTER` — feeds affinity scoring. |
| **Recommendation** | Ranked active products from category/product/search affinity; empty if no signal. |
| **Staff role** | Named permission bundle (`manager`, `designer`, `stock-auditor` presets seeded). |
| **Permission** | String capability e.g. `products:write`, `dashboard:read`, `homepage:write` — enforced API + UI. |
| **Agent** | *Not used in Luxian product code.* Portfolio “Ash AI” is separate. |

---

## Auth & security model (for technical questions)

- Passwords hashed with bcrypt (12 rounds).
- Access JWT short-lived; refresh JWT longer with rotation id stored hashed on user.
- Browser calls API with `credentials: "include"`; mutating requests send `X-CSRF-Token` from readable CSRF cookie.
- `RolesGuard` for coarse `ADMIN` routes; `PermissionsGuard` for staff granularity.
- Global `HttpExceptionFilter` normalizes API errors for the web client.

---

## Data entities (Prisma highlights)

- **User** — roles `USER`, `ADMIN`, `STAFF`; optional `staffRoleId`.
- **Product** — `price`, `cost`, `stock`, `restockLimit`, `sku`, images relation.
- **OrderItem** — snapshots `price` and `costAtSale` at purchase time.
- **FavoriteProduct** — user ↔ product join.
- **MediaAsset** — versioned media per owner type (product, category, collection, homepage).

---

## Seed & demo content

- `npm run db:seed` creates demo users, staff role presets, basic electronics/clothing SKUs, and **fashion catalog** via `seedFashionCatalog`.
- Password for demo users: `Secret1!` (documented in README — safe for local capture, rotate if ever deployed publicly).

---

## Deployment (production)

| Layer | URL | Role |
|-------|-----|------|
| Storefront | https://luxian-three.vercel.app/ | Next.js on Vercel — **public portfolio link** |
| API | https://luxian.onrender.com/ | NestJS on Render — `GET /api/v1` health/hello |
| Browser → API | `/api/v1` on Vercel host | `next.config.mjs` rewrites to `API_UPSTREAM` (Render) — cookies stay same-site for auth |
| Server → API | `API_INTERNAL_URL` | SSR, UploadThing auth, cache revalidate call Render directly |

**Ops checklist (not for portfolio copy):** Render `CORS_ORIGIN` must include `https://luxian-three.vercel.app`; cookie `Secure`/`SameSite` must match HTTPS production.

---

## Known gaps (answer honestly)

| Area | Status |
|------|--------|
| Stripe / real payments | Not implemented |
| Render cold start | Free/low tier may sleep; first request after idle can be slow |
| Email notifications | Not present |
| Shipping carriers | Address string only |
| AI shopping assistant | Not in scope |
| E2E test suite | Skipped on API learning track |

---

## File pointers for common Ash AI questions

- Checkout transaction: `api/src/modules/orders/orders.service.ts` (`checkout` method).
- Permissions list: `api/src/modules/auth/permissions/permission.registry.ts`.
- Homepage bundle: `web/features/homepage/server.ts`, `api/src/modules/homepage/homepage.service.ts`.
- Personalization scoring: `api/src/modules/personalization/personalization.scoring.ts`.
- API client + cookies: `web/lib/api-client.ts`.
- Admin dashboard UI: `web/components/admin/admin-dashboard-panel.tsx`.

---

## Portfolio narrative hooks (problem → system → outcome)

| Problem | System | Outcome |
|---------|--------|---------|
| Fashion brand needs editorial discovery, not a flat catalog | Homepage settings + collections + hero/mosaic components | Shoppers land in a branded story before SKU grid |
| Overselling breaks trust | Transactional checkout with stock `updateMany` guards + movements | Order only exists when stock and stub payment succeed |
| Small team can’t use one-size admin | Staff roles + permission-filtered admin | Designer updates homepage; stock auditor handles suppliers without full dashboard |
| Guessing what to promote | Visitor events + recommendations | PDP shows related items from on-site behavior |
| Reordering from suppliers is separate from web stock | Supplier orders + receive flow → stock movements | Dashboard reflects inbound pipeline and restock needs |

---

## Strongest visual surfaces (repeat for asset planning)

1. `/` — full homepage composition  
2. `/products/[id]` — gallery + recommendations  
3. `/admin/dashboard` — insights  
4. `/admin/homepage` — merchandising control  
5. `/checkout` + `/account/orders/[id]` — commerce completion  
