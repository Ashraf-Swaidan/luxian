# Luxian

Learning monorepo: NestJS API + Next.js storefront (in progress).

## Structure

| Path | Stack |
|------|--------|
| `api/` | NestJS, Prisma, PostgreSQL |
| `web/` | Next.js (App Router), Tailwind, shadcn/ui — see [frontend plan](#frontend-bootstrap) |

## Quick start (API)

```bash
cd api
cp .env.example .env   # fill DATABASE_URL, JWT_SECRET
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Base URL: `http://localhost:3000/api/v1`

Demo logins (after seed): `admin@demo.com` / `user@demo.com` — password `Secret1!`

## Frontend bootstrap

From the **repo root** (creates `web/`, does not use shadcn’s Turborepo layout):

```bash
npx shadcn@latest init --preset b1G2AXDzm --template next --pointer --no-monorepo -n web -y
```

**Nested git:** shadcn has no `--no-git`. If `web/.git` exists, remove it so only the root repo tracks `web/`:

```powershell
# PowerShell, from repo root
if (Test-Path web\.git) { Remove-Item -Recurse -Force web\.git }
```

Then: set Next to port **3001**, add `web/.env.local` from `web/.env.example`, enable CORS on the API — see `FRONTEND_LEARNING_REPORT.md` §0 (F0).

## Quick start (Web, after F0)

```bash
cd web
cp .env.example .env.local
npm install
npm run dev
```

Storefront: `http://localhost:3001` (API must be running on `3000`).

## Docs

- `api/LEARNING_REPORT.md` — API roadmap & progress
- `FRONTEND_LEARNING_REPORT.md` — frontend roadmap
- `api/POSTMAN_TESTING.md` — manual API tests
