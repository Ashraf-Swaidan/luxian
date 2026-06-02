# Luxian — Asset Slots

Slug on portfolio: **`luxian`**

## URLs

| Type | Value |
|------|--------|
| **Public deploy** | *None in repo* — local demo only (`http://localhost:3001`). Update this row when/if Vercel/Railway deploy exists. |
| **GitHub repo** | Confirm with owner — workspace path suggests `luxian-store/luxian`. Placeholder: `https://github.com/ashraf-swaidan/luxian` *(verify before publish)* |

---

## Logo

| Asset | Path | Notes |
|-------|------|--------|
| Raster logo | `web/public/luxian-logo.png` | Use on light backgrounds; wordmark “LUXIAN” also rendered in CSS (`font-display` / Clash Display). |
| SVG | *Not in repo* — export from design or trace PNG if portfolio requires SVG. |
| Favicon set | `web/public/favicon_io/*` | ICO + PNG sizes for browser tab only. |

**Background guidance**

- Storefront/admin UI: **light** (`bg-white`, `neutral-950` text) — logo PNG should have transparency or light-safe padding.
- Hero may use **custom dark/colored** `heroBackgroundColor` from homepage settings — test contrast if placing logo on hero captures.

---

## Filename → case study section map

| Filename (suggested) | Section on case study page | Content |
|----------------------|----------------------------|---------|
| `hero-loop.mp4` | Hero / above the fold | 20–35s loop per `capture-guide.md` |
| `thumb-cover.webp` | Project card / carousel | Static homepage hero frame (1920×1080 crop) |
| `01-homepage.webp` | Problem → outcome | Full editorial homepage |
| `02-product-detail.webp` | System | PDP with gallery + recommendations |
| `03-checkout.webp` | System | Cart or checkout confirmation |
| `04-admin-dashboard.webp` | Outcome (operations) | Insights dashboard — caption as demo data |
| `05-admin-homepage.webp` | System (merchandising) | Homepage settings panel |
| `logo-luxian.png` | Header / meta | From `web/public/luxian-logo.png` |
| `architecture-diagram.webp` | Optional “How it works” | Nest ↔ Next ↔ Postgres (hand-drawn or simple diagram; not in repo) |
| `luxian-scroll-home.mp4` | Optional gallery | Short homepage scroll |
| `luxian-add-to-cart-checkout.mp4` | Optional gallery | Purchase flow |
| `luxian-admin-dashboard.mp4` | Optional gallery | Admin insights |
| `mobile-home.webp` | Optional responsive | 390px homepage |
| `mobile-pdp.webp` | Optional responsive | 390px product detail |

---

## Repo paths for Ash AI (source, not portfolio uploads)

| Purpose | Path |
|---------|------|
| API modules | `api/src/modules/` |
| Prisma schema | `api/prisma/schema.prisma` |
| Storefront routes | `web/app/` |
| Admin UI | `web/components/admin/` |
| Homepage server bundle | `web/features/homepage/` |
| Learning / status docs | `README.md`, `api/LEARNING_REPORT.md`, `FRONTEND_LEARNING_REPORT.md` |

---

## What NOT to commit to portfolio assets

- `.env`, `.env.local`, database connection strings
- UploadThing or R2 secret screens
- Real user exports from a production DB
