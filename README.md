# Luxian

Learning monorepo: NestJS API + Next.js storefront (in progress).

## Structure

| Path | Stack |
|------|--------|
| `api/` | NestJS, Prisma, PostgreSQL |
| `web/` | Next.js (App Router) — not created yet |

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

## Docs

- `api/LEARNING_REPORT.md` — API roadmap & progress
- `FRONTEND_LEARNING_REPORT.md` — frontend roadmap
- `api/POSTMAN_TESTING.md` — manual API tests
