# Luxian — Portfolio insertion checklist (Ashraf)

Use when adding the project to [ashraf-swaidan](https://github.com/ashraf-swaidan) portfolio context tomorrow.

## Links to wire in the portfolio CMS

| Field | Value |
|-------|--------|
| **Live demo** | https://luxian-three.vercel.app/ |
| **Slug** | `luxian` |
| **Repo** | Confirm GitHub URL before publish |
| **API (optional footnote)** | https://luxian.onrender.com/ — split deploy only; don’t use as primary CTA |

## Copy-ready snippets

**Carousel (from brief):**  
Custom fashion storefront and staff back office in one codebase: shoppers browse a merchandised homepage and checkout with real inventory rules; operators manage catalog, suppliers, and profit-aware insights behind permission-scoped admin tools.

**Problem → system → outcome (one line each):**

- **Problem:** A fashion brand needs editorial discovery and inventory-safe selling, not a generic template store.
- **System:** Next.js storefront + Nest API + Postgres, with merchandising CMS, RBAC admin, supplier stock ledger, and visitor recommendations.
- **Outcome:** Live demo where checkout, stock, and operator dashboards share one data model.

## Pre-flight on production (5 min)

- [ ] Homepage loads at https://luxian-three.vercel.app/
- [ ] Login works: `user@demo.com` / `admin@demo.com` / `Secret1!`
- [ ] If login fails: check Render API awake + `CORS_ORIGIN` includes Vercel URL
- [ ] Admin hub: https://luxian-three.vercel.app/admin
- [ ] Do **not** invent metrics; dashboard numbers = seeded/production DB only

## Assets to capture or drop in

See `capture-guide.md` and `asset-slots.md`.

**Priority screens:** homepage → PDP → checkout → admin dashboard → admin homepage.

**Suggested filenames:** `thumb-cover.webp`, `01-homepage.webp` … `05-admin-homepage.webp`, optional `hero-loop.mp4`.

## Context files for Ash AI

| File | Use |
|------|-----|
| `PORTFOLIO_PROJECT_BRIEF.md` | Card + case study spine |
| `about-luxian.md` | Deep Q&A / retrieval |
| `capture-guide.md` | Recording script |
| `asset-slots.md` | Filename → section map |

## Privacy reminder

- No `.env`, Neon/Render credentials, or UploadThing keys in screenshots.
- Demo accounts only; no real customer PII.

## After insertion

- [ ] Case study “Visit site” → Vercel URL
- [ ] Resume bullets synced from brief (optional tweak: “Deployed live on Vercel + Render”)
- [ ] Tag stack in portfolio metadata: Next.js, NestJS, PostgreSQL, Prisma — not “Shopify”
