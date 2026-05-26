# Luxian — Frontend Learning Report

> **Living document.** Mirror of the API learning workflow — status, roadmap, progress log.  
> **API base URL:** `http://localhost:3000/api/v1` (Nest runs on port 3000 by default)  
> **Update after every completed step.**

---

## How we work together (mentor ↔ student)

Same contract as `api/LEARNING_REPORT.md`:

| Principle | Meaning |
|-----------|---------|
| **Orient first** | What we build, which files, how it talks to the Nest API |
| **Why before how** | React/Next concepts, not “copy Tailwind template” |
| **One concept per step** | Small diffs |
| **After every change, four questions** | What / Why / Remember / Recreate |
| **You code, mentor reviews** | Unless you say **“do F2”** |

**Cursor rule:** Reuse `api/rules/nestjs-learning-mentor.mdc` mindset for `web/` (or add `web/rules/` later).

---

## Stack (target)

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **Next.js** (App Router) | Matches project name; SSR + file-based routes |
| Language | **TypeScript** | Same as API |
| Styling | **Tailwind CSS** (default from `create-next-app`) | Fast UI for learning |
| Data fetching | **`fetch`** first, optional **TanStack Query** later | Learn HTTP before abstractions |
| Auth storage | **httpOnly cookies** (goal) or **localStorage** (simpler v1) | JWT access token from Nest |
| API | Existing Nest monolith | No Next.js API routes for business logic in v1 |

---

## Repo layout (target)

```text
luxian/          ← one Git repo (recommended)
├── api/                      ← Nest (already built)
├── web/                      ← Next.js (to create)
├── FRONTEND_LEARNING_REPORT.md
└── README.md                 ← how to run api + web
```

**Not** two separate GitHub repos unless you explicitly want that for portfolio reasons.

---

## What the frontend must do (maps to API)

| User story | API endpoints |
|------------|----------------|
| Browse products | `GET /products`, categories filter optional |
| Register / login | `POST /auth/register`, `POST /auth/login` |
| Stay logged in | `GET /auth/me`, `POST /auth/refresh`, `POST /auth/logout` |
| Cart | `GET /cart`, `POST /cart/items`, `PATCH/DELETE ...` |
| Place order (pay) | `POST /orders/checkout` (order + payment in one step) |
| Order history | `GET /orders`, `GET /orders/:id` |
| Admin catalog (optional phase) | Categories/products CRUD + `RolesGuard` routes |

---

## Phase F0 — Project setup

- [ ] **F0.1** — Create `web/` with `create-next-app` (TypeScript, App Router, Tailwind) — **use `--no-git`** if parent repo will own Git
- [ ] **F0.2** — `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1`
- [ ] **F0.3** — Nest: enable **CORS** for `http://localhost:3000` (Next default port **3000** conflicts — run Next on **3001** or change Nest `PORT`)
- [ ] **F0.4** — Shared `lib/api.ts`: `fetch` wrapper (base URL, JSON, attach `Authorization` header)
- [ ] **F0.5** — Home page: health check — fetch `GET {{API}}/` or list products; prove browser → Nest works

**Remember:** Browser calls a **different origin** than the API → CORS required.

---

## Phase F1 — Layout & catalog (public)

- [ ] **F1.1** — Root `layout.tsx`: header, nav, footer
- [ ] **F1.2** — `app/products/page.tsx` — list products from API (Server Component `fetch` or Client — pick one and stick to it for F1)
- [ ] **F1.3** — `app/products/[id]/page.tsx` — product detail (if API exposes single product; else use list + filter)
- [ ] **F1.4** — Loading + error UI for failed fetch
- [ ] **F1.5** — Categories: filter or `/categories` page using `GET /categories`

**Concepts:** App Router folders = routes; Server vs Client Components; `NEXT_PUBLIC_*` env vars.

---

## Phase F2 — Auth UI

- [ ] **F2.1** — `app/login/page.tsx`, `app/register/page.tsx` — forms + DTO-shaped bodies (match API validation rules)
- [ ] **F2.2** — On success: store `accessToken` (+ `refreshToken` if using localStorage approach)
- [ ] **F2.3** — `AuthProvider` (client context): user from `GET /auth/me` on load
- [ ] **F2.4** — Header: Login / Logout; show email when logged in
- [ ] **F2.5** — Optional: refresh flow before access token expires

**Concepts:** Controlled forms; context; protected vs public routes.

---

## Phase F3 — Cart

- [ ] **F3.1** — “Add to cart” on product page — `POST /cart/items` (requires JWT)
- [ ] **F3.2** — `app/cart/page.tsx` — `GET /cart`, show lines, quantities
- [ ] **F3.3** — Update quantity / remove line
- [ ] **F3.4** — Redirect to login if 401

**Concepts:** Auth header on mutating requests; optimistic UI optional later.

---

## Phase F4 — Checkout & orders

- [ ] **F4.1** — Checkout page: optional `shippingAddress`, button → `POST /orders/checkout`
- [ ] **F4.2** — Thank-you / order detail page — show `orderNumber`, items, `payment`
- [ ] **F4.3** — `app/orders/page.tsx` — order history (`GET /orders`)
- [ ] **F4.4** — `app/orders/[id]/page.tsx` — single order

**Concepts:** One-step checkout matches API (no separate pay page).

---

## Phase F5 — Admin (optional, after shop works)

- [ ] **F5.1** — Login as `admin@demo.com` (seed)
- [ ] **F5.2** — Admin layout + role check (hide if not ADMIN — API still enforces 403)
- [ ] **F5.3** — CRUD UI for categories & products

**Concepts:** RBAC on both sides; never trust frontend alone.

---

## Phase F6 — Polish

- [ ] **F6.1** — Parse API error shape from `HttpExceptionFilter` (`statusCode`, `message`, `path`)
- [ ] **F6.2** — Product images via `imageUrl` + placeholder component
- [ ] **F6.3** — Basic responsive layout
- [ ] **F6.4** — README: run api + web + seed

---

## Progress log

| Date | Step | Summary | Concepts to remember |
|------|------|---------|----------------------|
| — | — | Frontend plan created | Monorepo: one repo for `api` + `web` |

### Current focus

**Not started.** Begin **F0** (create `web/`, CORS, env, first fetch).

### Notes & questions (scratchpad)

_Add aha moments here._

---

## Git strategy (read this before `create-next-app`)

### Current state

- Git lives **only inside** `api/` (`api/.git`).
- Parent folder `luxian/` is **not** a Git repo yet.
- Your `master` branch has **5 commits**; no `origin` remote was configured from the CLI scan — publishing fails until you add a GitHub remote.

### Recommended: one monorepo

| Approach | Structure | Fit for this project |
|----------|-----------|----------------------|
| **Monorepo** (recommended) | `luxian/.git` with `api/` + `web/` | Matches folder name; one clone; one PR history |
| **Two repos** | `nestjs-ecommerce-api` + `nestjs-ecommerce-web` | More ops; only if you want separate portfolios |

### Will Next.js create its own repo?

`create-next-app` runs `git init` **by default**. That would give you `web/.git` **nested inside** `api/.git`’s parent — messy.

**Use:**

```bash
npx create-next-app@latest web --typescript --tailwind --eslint --app --src-dir --no-git
```

### End state (one repo)

```text
luxian/     ← git root
  .git/
  api/                   ← Nest (no nested .git)
  web/                   ← Next (no nested .git)
```

**Migration (when you’re ready — not automatic):**

1. Backup / push `api` commits somewhere safe.
2. Remove `api/.git` (or move repo root up with `git subtree` / re-init — mentor can walk you through).
3. `git init` at `luxian`, commit `api/` + `web/`.
4. `git remote add origin <github-url>` → `git push -u origin main`.

### Why publish might be blocked in the UI

Common causes:

- No **remote** configured (`git remote -v` empty).
- Remote exists but **no permission** / wrong account / repo not created on GitHub.
- Branch name mismatch (`master` vs `main`).
- Large files or auth (HTTPS token / SSH key).

**Quick check in `api/` folder:**

```bash
git remote -v
git status
```

If `remote` is empty: create empty GitHub repo → `git remote add origin https://github.com/you/luxian.git` → `git push -u origin master` (or rename to `main` first).

---

## Changelog (report versions)

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 2026-05-26 | Initial frontend learning plan + git notes |
