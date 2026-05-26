# NestJS E-Commerce API — Learning Report

> **Living document.** This file is the single source of truth for project status, discoveries, and progress.  
> **Update after every completed step** (see [Progress log](#progress-log) at the bottom).

---

## How we work together (mentor ↔ student)

This is an **educational** project. Speed and “finishing fast” are not the goal — **understanding that sticks** is.

Whenever we start or finish a step, explanations should follow this mentor–student contract:

| Principle | What it means for you |
|-----------|------------------------|
| **Orient first** | Before touching code, say *what* we’re doing, *where* it lives in the project, and *how* it connects to what you already built. |
| **Why before how** | Every change needs a reason tied to a real Nest/Prisma/HTTP concept — not “because best practice says so” in the abstract. |
| **Elaborate, don’t skim** | Use clear, complete sentences. Analogies are welcome when they clarify (e.g. Module = plug-in socket, Guard = bouncer). |
| **One concept per step** | Small diffs. If a step teaches ValidationPipe, we don’t also refactor auth in the same breath unless you ask. |
| **After every change, four questions** | 1) What changed? 2) Why? 3) What should you remember? 4) How could you rebuild it yourself from scratch? |
| **No silent rewrites** | We don’t reshape the whole repo without explaining the plan. |
| **Honest about gaps** | If something is stubbed, wrong, or “good enough for learning,” we say so plainly. |
| **You can challenge** | Ask “what if I removed X?” or “why not Y?” — that’s part of learning. |

### Workflow: you code, mentor reviews

| Phase | Who does what |
|-------|----------------|
| **Before** | Mentor explains the step (orient, why, which files, hints — **no full solution paste** unless you ask). |
| **During** | **You** edit the code locally. |
| **After** | You say e.g. *“check A4”* or *“I’m done with A4”* → mentor reviews, corrects, explains mistakes, updates this report. |

**Cursor rule:** `api/rules/nestjs-learning-mentor.mdc` enforces this workflow.

---

## Stack

- **NestJS** — HTTP API framework (modules, controllers, services, guards)
- **Prisma** — ORM + migrations
- **PostgreSQL** — database (hosted on **Neon** via `DATABASE_URL`)
- **Direction:** auth → guards → RBAC → domain modules → polish

---

## 1. Project structure

```
api/
├── prisma/
│   ├── schema.prisma          # DB models & relations
│   ├── migrations/            # Applied SQL history
│   └── prisma.config.ts       # Prisma 7: schema path, DB URL from .env
├── src/
│   ├── main.ts                # Bootstrap (listen, global prefix, pipes later)
│   ├── app.module.ts          # Root module — imports feature modules
│   ├── app.controller.ts      # Root HTTP route (hello/health)
│   ├── prisma/
│   │   ├── prisma.module.ts   # @Global() — shares DB client app-wide
│   │   └── prisma.service.ts  # PrismaClient + connect/disconnect lifecycle
│   └── modules/auth/          # Auth feature (in progress)
│       ├── auth.module.ts
│       ├── auth.controller.ts
│       ├── auth.service.ts
│       ├── dto/
│       └── strategies/jwt.strategy.ts  # stub
├── plan.md                    # Original learning goals (agent brief)
└── LEARNING_REPORT.md         # ← this file
```

**Mental model:** Request hits a **controller** → **service** runs business logic → **PrismaService** talks to Postgres. Modules bundle related controllers/services and declare dependencies.

---

## 2. What already exists

| Area | Status |
|------|--------|
| NestJS shell | `main.ts`, `AppModule`, global prefix `api/v1` |
| Config | `@nestjs/config` — global `.env` |
| Database client | Prisma 7 + `@prisma/adapter-pg` for PostgreSQL/Neon |
| Schema | User, Product, Category, Cart, CartItem, Order, OrderItem, Payment + enums |
| Migration | `20260524133731_init` — tables created in Neon |
| Prisma in Nest | Global `PrismaModule` + `PrismaService` (`onModuleInit` / `onModuleDestroy`) |
| Auth (partial) | Register DTO with validation decorators, bcrypt hash, JWT module registered |
| Tests | Boilerplate `*.spec.ts` files (minimal assertions) |

---

## 3. Issues & incomplete setup (fix first)

### Critical — breaks or blocks learning

| # | Issue | Why it matters |
|---|--------|----------------|
| C1 | `AuthController.register` has **no `@Post('register')`** | Nest only exposes methods with HTTP decorators — route may not exist |
| C2 | `generateTokens()` returns **empty strings** | Register saves user but client gets useless tokens |
| C3 | **`JwtStrategy` is a stub** — not in `AuthModule.providers`, no `passport-jwt` | Protected routes cannot work yet |
| C4 | **No `ValidationPipe`** in `main.ts` | `class-validator` on DTOs is ignored |
| C5 | **`class-transformer` not installed** | Needed for typical `ValidationPipe` options |

### Schema / data model

| # | Issue | Notes |
|---|--------|--------|
| S1 | `Category.orderNumber` | Likely copy-paste from `Order` — wrong field on Category; already in DB via migration |
| S2 | `Order.status` has no `@default` | Must set status on every create (OK if intentional) |

### Patterns to improve (educational hygiene)

| # | Issue | Notes |
|---|--------|--------|
| P1 | JWT fallback secret `'default_secret2026'` | Fine locally; never ship to production |
| P2 | `register()` catches all errors → generic 500 | Hides real Prisma errors while debugging |
| P3 | `console.log` in `PrismaService` | Prefer Nest `Logger` later |
| P4 | `cleanDatabase()` via reflection | Fragile; only for tests when needed |

### Not started yet (expected)

- Login endpoint, refresh token flow
- `JwtAuthGuard`, `RolesGuard`
- Product / Category / Cart / Order modules
- Global exception filter, `.env.example`, seed script, meaningful e2e tests

---

## 4. Prisma deep dive

### Schema (`prisma/schema.prisma`)

- **Models** → tables (`@@map("users")` sets physical table name).
- **Fields** → columns; `@id @default(uuid())`, `@unique`, indexes `@@index`.
- **Relations** → foreign keys (`Product.categoryId` → `Category.id`).
- **Enums** → `Role`, `OrderStatus`, `PaymentStatus` — type-safe constants in DB and TypeScript.

### Migration

- Command `prisma migrate dev` generates SQL under `prisma/migrations/<timestamp>_<name>/`.
- That SQL is what **Neon actually runs** — schema file alone does not change production DB until migrated.
- **Drift** = schema file ≠ database; fix with new migration or reset (dev only).

### `PrismaModule` (`@Global()`)

- Registers `PrismaService` once for the whole app.
- **Global** = other modules inject `PrismaService` without importing `PrismaModule` again.
- Treat as **infrastructure**, not a user-facing feature.

### `PrismaService`

- Extends `PrismaClient`.
- Uses **driver adapter** `PrismaPg` + `DATABASE_URL` (common with Neon/serverless Postgres).
- `onModuleInit` → `$connect()` when Nest boots.
- `onModuleDestroy` → `$disconnect()` on shutdown.

### Why Prisma has no controller

Prisma is a **database client**, not HTTP. Exposing it via a controller would mean raw DB access over the internet. Correct flow:

**HTTP Controller → Service → PrismaService → PostgreSQL**

---

## 5. What the app can do today

| Endpoint | Works? |
|----------|--------|
| `GET /api/v1` | ✅ Hello from `AppController` |
| `POST /api/v1/auth/register` | ❌ Missing `@Post`; tokens empty even if wired |
| Login / JWT-protected routes | ❌ |
| Products, cart, orders | ❌ No modules yet |

If `DATABASE_URL` is valid and the server starts, you should see DB connect logs from `PrismaService`.

---

## 6. Gap vs professional backend workflow

1. Reliable auth (validate → register → real JWT → login → guard → roles)
2. Documented env vars (`.env.example`)
3. Feature modules per domain
4. DTO + `ValidationPipe` on all inputs
5. Guards and RBAC
6. Consistent error responses
7. Prisma: `select` to omit passwords, `$transaction` for checkout
8. Tests: unit (mock Prisma) + e2e (Supertest)
9. Dev ergonomics: seed, `prisma studio`, migrate scripts in README

---

## 7. Learning roadmap (phases)

Check off steps in [Progress log](#progress-log) as we complete them.

### Phase A — Foundations

- [x] **A1** — `ValidationPipe` in `main.ts`
- [x] **A2** — Install `class-transformer`
- [x] **A3** — `@Post('register')` on `AuthController`
- [x] **A4** — Finish `generateTokens()` (real access + refresh JWTs)
- [x] **A5** — Remove `Category.orderNumber` + migration
- [x] **A6** — Add `.env.example`

### Phase B — Auth complete

- [x] **B1** — `LoginDto` + `POST /auth/login`
- [x] **B2** — `bcrypt.compare` in login
- [x] **B3** — `passport-jwt` + complete `JwtStrategy`
- [x] **B4** — Register `JwtStrategy` in `AuthModule`
- [x] **B5** — `JwtAuthGuard` + `GET /auth/me`
- [x] **B6** — Refresh token storage + refresh endpoint + logout

### Phase C — Authorization

- [x] **C1** — `@Roles()` decorator
- [x] **C2** — `RolesGuard`
- [x] **C3** — Admin-only example route

### Phase D — Domain modules

- [x] **D1** — CategoriesModule (list, create, PATCH update, DELETE soft delete)
- [x] **D2** — ProductsModule (list, create, PATCH, DELETE deactivate)
- [x] **D3** — CartModule
- [x] **D4** — OrdersModule (checkout + `$transaction`, list/detail)
- [ ] **D5** — PaymentsModule

### Phase E — Polish

- [ ] **E1** — Global exception filter
- [ ] **E2** — Nest `Logger` in PrismaService
- [ ] **E3** — Prisma seed script
- [ ] **E4** — E2E tests for auth

---

## Progress log

_Update this section after every completed step._

| Date | Step | Summary | Concepts to remember |
|------|------|---------|----------------------|
| 2026-05-24 | — | Initial repo scan & report written | Module/controller/service split; Prisma has no controller; auth is partial |
| 2026-05-24 | A1 | Global `ValidationPipe` in `main.ts` (`whitelist`, `forbidNonWhitelisted`) | Pipes run before controllers; invalid body → 400 Bad Request |
| 2026-05-24 | A2 | `class-transformer` + `transform: true` on ValidationPipe | Plain JSON → DTO instance; whitelist strips unknown keys reliably |
| 2026-05-24 | A3 | `@Post('register')` on `AuthController` | HTTP verb + path = route; full URL: `POST /api/v1/auth/register` |
| 2026-05-24 | A4 | `generateTokens()` — dual `signAsync`, `15m` / `7d`, `refreshId` on refresh payload | Access = short JWT; refresh = long JWT + rotation id for B6 |
| 2026-05-25 | A5 | Removed `Category.orderNumber`; migration `remove_category_order_number` | Schema fix + `migrate dev` drops column/index on Neon |
| 2026-05-25 | A6 | `.env.example` with PORT, DATABASE_URL, JWT_*; `.env` gitignored | Template documents config without secrets |
| 2026-05-25 | B1+B2 | Login DTO, `POST /login`, `bcrypt.compare`, `generateTokens` on success | New session = new JWTs; fix: don’t return `password` hash; prefer 401 for unknown email |
| 2026-05-25 | B3+B4 | `JwtStrategy` with `super()` + `validate()`; registered in `AuthModule` | Verify in passport; `validate` loads user → `req.user`; method must be class member |
| 2026-05-25 | B5 | `JwtAuthGuard` + `GET /auth/me` → `req.user` | Guard = switch for passport `'jwt'`; 401 without valid Bearer |
| 2026-05-25 | C1–C3 | `@Roles` metadata + `RolesGuard` + `GET /admin-only` | 401 = no/invalid JWT; 403 = JWT ok but wrong role |
| 2026-05-25 | B6 | Hash refresh in DB; `POST /refresh`, `POST /logout` | Rotation: new refresh invalidates old hash; logout clears DB |
| 2026-05-25 | — | Full Postman pass (auth, catalog, cart) — all green | End-to-end manual QA before checkout |
| 2026-05-26 | D4 | OrdersModule: checkout, stock decrement in `$transaction`, `checkedOut`, GET orders | Cart = draft; order = receipt; commit-time validation; `updateMany` + `gte` for stock races |

### Current focus

**D4 done** (Postman Phase 7 passed). **Next:** **D5** PaymentsModule, then **Phase E** polish.

### Notes & questions (your scratchpad)

_Add questions or “aha” moments here as we go._

---

## Changelog (report versions)

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 2026-05-24 | Initial report from repo scan |
| 1.1 | 2026-05-24 | A1 complete — global ValidationPipe |
| 1.2 | 2026-05-24 | A2 complete — class-transformer + transform pipe options |
| 1.3 | 2026-05-24 | A3 complete — POST register route |
| 1.4 | 2026-05-24 | A4 reviewed — real JWTs in `generateTokens()` |
| 1.5 | 2026-05-25 | A5 complete — Category schema + migration |
| 1.6 | 2026-05-25 | A6 complete — `.env.example`; Phase A done |
