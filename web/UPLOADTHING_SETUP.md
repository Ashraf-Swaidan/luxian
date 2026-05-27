# UploadThing setup (Luxian admin images)

Product and category images upload **from the Next.js admin UI** directly to UploadThing. Nest only stores the returned URL in `imageUrl`.

## 1. Dashboard

1. Sign in at [uploadthing.com](https://uploadthing.com).
2. Create an app (or use the default).
3. Copy your **API key** from the dashboard.

## 2. Environment

In `web/.env.local`:

```env
# Single token from UploadThing dashboard (may look like sk_live_…)
UPLOADTHING_TOKEN=your_token_here

NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

Some dashboards still show separate values — if so, you can also try:

```env
UPLOADTHING_SECRET=sk_live_…
UPLOADTHING_APP_ID=…
```

Restart the web dev server after saving.

## 3. Test

1. API running on port 3000.
2. `npm run dev` in `web/`.
3. Log in as **admin@demo.com** / `Secret1!`.
4. **Admin → Products** → **Upload image** → create or save product.

Images are served from UploadThing’s CDN (`utfs.io` and `*.ufs.sh`). `next.config.mjs` allows those hosts — restart the dev server after changing `next.config.mjs`.

## How auth works

- The upload button sends your Luxian **JWT** in the `Authorization` header.
- UploadThing middleware calls `GET /auth/me` on your Nest API and requires `role: ADMIN`.
- No UploadThing secrets in the browser.

## Nest R2 module

The optional Cloudflare R2 upload route under `api/src/modules/uploads` is unused when using UploadThing. You can ignore R2 env vars.
