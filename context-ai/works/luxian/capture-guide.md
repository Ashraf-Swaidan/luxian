# Luxian — Capture Guide

Target: **1920×1080** for hero loop and stills; UI at 100% browser zoom unless noted.

## Prerequisites

### Production capture (preferred for portfolio)

| | |
|--|--|
| **URL** | [https://luxian-three.vercel.app/](https://luxian-three.vercel.app/) |
| **Accounts** | `user@demo.com` / `admin@demo.com` — password `Secret1!` |
| **Cold start** | If the first load is slow, wait for Render API wake-up (or hit `/api/v1` once), then re-record. |

No local terminals required. API is proxied at `/api/v1` from Vercel → `https://luxian.onrender.com`.

### Local capture (fallback)

1. Terminal A: `cd api && npm run dev` (port 3000).
2. Terminal B: `cd web && npm run dev` (port 3001).
3. Seed if needed: `cd api && npx prisma migrate dev && npm run db:seed`.
4. Use **demo accounts only** (see README).

| Account | Password | Use |
|---------|----------|-----|
| `user@demo.com` | `Secret1!` | Shopper flows |
| `admin@demo.com` | `Secret1!` | Full admin |

---

## Hero loop (20–35 seconds, 1920×1080)

**Story arc:** Problem → system → outcome (portfolio site pattern).

| Segment | Time | Action | Proves |
|---------|------|--------|--------|
| 1 — Discover | 0–8s | Start at `/` (logged out). Slow scroll: hero → latest products → summer banner → trending → mosaic → collection pair. | Merchandised brand experience, not a generic product grid. |
| 2 — Shop | 8–18s | Open a fashion product (`/products/[id]`). Hover gallery; optional heart (login prompt OK). Add to cart → `/cart` → `/checkout` as `user@demo.com`. Submit order. | Real cart + checkout path. |
| 3 — Operate | 18–28s | Log out or new tab; log in `admin@demo.com`. Open `/admin/dashboard` (Home/Sales tab). Quick cut to `/admin/homepage` or `/admin/products`. | Operator back office + insights. |
| 4 — Outcome | 28–35s | `/account/orders` as shopper OR admin order list — show **PROCESSING** + completed stub payment. End on homepage hero freeze-frame. | Inventory-safe order + payment record. |

**Recording tips**

- Hide OS notifications; use clean browser profile.
- Prefer **fashion catalog** products (seeded Luxian SKUs) over legacy “Demo Smartphone” items.
- If homepage colors were customized, capture **after** saving in admin so hero matches brand.

### Safe / demo data rules

| Do | Don’t |
|----|--------|
| `user@demo.com` / `admin@demo.com` | Real emails, real addresses, real card numbers |
| `luxian-three.vercel.app` in frame (shows it’s live) | Render dashboard, Vercel env panels, API keys on screen |
| Seeded product titles and stock counts | Invented “$2M GMV” overlays |
| Blur or crop env files if terminal visible | Show `.env` panes |

---

## Five case-study screenshots

| # | Screen | Route | What it should prove |
|---|--------|-------|----------------------|
| 1 | **Editorial homepage** | `/` | Problem: brand needs more than a SKU list. Outcome: curated hero + collections + visual sections. |
| 2 | **Product detail** | `/products/[id]` | System: catalog depth (images, price, stock), favorites, recommendations. |
| 3 | **Cart & checkout** | `/cart` → `/checkout` | System: authenticated cart, shipping field, one-step place order. |
| 4 | **Operations dashboard** | `/admin/dashboard` | Outcome: operator visibility (revenue/profit cards, orders pipeline, restock/supplier signals) — label as **demo/seed data**. |
| 5 | **Homepage merchandising** | `/admin/homepage` | System: non-developers can retie collections, hero copy, imagery, and colors without code changes. |

**Alternate swap-ins** (if a slot needs variety)

- `/admin/products/[id]` — stock movements + multi-image editor.
- `/admin/suppliers` — inbound supplier order receiving.
- `/admin/staff` — roles and permissions (ADMIN only).

---

## Optional short workflow MP4s (5–15s each)

| Filename | Scene |
|----------|--------|
| `luxian-scroll-home.mp4` | Slow scroll full homepage (logged out). |
| `luxian-add-to-cart-checkout.mp4` | Product → add to cart → checkout success toast/redirect. |
| `luxian-admin-dashboard.mp4` | Admin dashboard tab switch (Home → Sales or Orders). |
| `luxian-homepage-save.mp4` | Admin homepage: change hero heading or color → save → hard refresh `/` showing change. |
| `luxian-supplier-receive.mp4` | Admin suppliers: mark inbound order received (stock increases). |

---

## Responsive proof (if needed)

| Breakpoint | Width | Flow to capture |
|------------|-------|-----------------|
| Mobile | 390×844 | Homepage hero stack + thumb product row; product detail add-to-cart |
| Tablet | 768×1024 | Homepage grid columns; admin hub card grid (2 cols) |
| Desktop | 1920×1080 | Full homepage + admin dashboard (primary portfolio assets) |

**Priority:** Desktop first; add one mobile homepage + one mobile product detail only if the case study page has a “responsive” section.

---

## Pre-capture checklist

- [ ] API and web both running; no console error overlay on homepage.
- [ ] Fashion seed loaded (categories like Shirts & Tops, not only Electronics).
- [ ] UploadThing configured if capturing **image upload** (otherwise skip upload UI).
- [ ] Browser zoom 100%; dark/light mode consistent (storefront is light/neutral).
