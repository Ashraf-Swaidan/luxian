# Cloudflare R2 setup for Luxian image uploads

Luxian stores product and category images in **Cloudflare R2** (S3-compatible). The Nest API uploads files; the database keeps the public **URL** in `imageUrl`.

## 1. Create an R2 bucket

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/) → **R2 Object Storage**.
2. **Create bucket** (e.g. `luxian-media`).
3. Note the bucket name for `R2_BUCKET_NAME`.

## 2. Create API credentials

1. R2 → **Manage R2 API Tokens** → **Create API token**.
2. Permissions: **Object Read & Write** on your bucket (or account-wide for dev).
3. Save **Access Key ID** and **Secret Access Key** (shown once).

## 3. Account ID

On the R2 overview page, copy your **Account ID** → `R2_ACCOUNT_ID`.

## 4. Public URL (so the storefront can load images)

Pick one:

### Option A — R2.dev subdomain (quickest for learning)

1. Open your bucket → **Settings** → **Public access**.
2. Enable **Allow Access** / public bucket (R2.dev subdomain).
3. Copy the public URL, e.g. `https://pub-xxxxxxxx.r2.dev` → `R2_PUBLIC_URL` (no trailing slash).

### Option B — Custom domain (production)

1. Connect a domain (e.g. `images.yourdomain.com`) to the bucket in Cloudflare.
2. Use `https://images.yourdomain.com` as `R2_PUBLIC_URL`.

## 5. Configure the API

In `api/.env`:

```env
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=luxian-media
R2_PUBLIC_URL=https://pub-xxxxxxxx.r2.dev
```

Restart the API: `npm run dev`.

## 6. Configure Next.js (storefront)

In `web/.env.local`, set the **hostname only** (no `https://`):

```env
NEXT_PUBLIC_IMAGE_HOST=pub-xxxxxxxx.r2.dev
```

Or your custom domain hostname. Restart `npm run dev` in `web/`.

## 7. Test

1. Sign in as **admin@demo.com** / `Secret1!`.
2. Go to **Admin → Products** (or Categories).
3. Choose an image and create/update — you should see a preview and the image on the shop after save.

## API endpoint

| Method | Path | Auth | Body |
|--------|------|------|------|
| `POST` | `/api/v1/uploads/image?folder=products` | Admin JWT | `multipart/form-data`, field name `file` |

Response:

```json
{ "url": "https://pub-xxx.r2.dev/products/uuid.jpg", "key": "products/uuid.jpg" }
```

Folders: `products`, `categories`, or `uploads` (default).

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `503 Image uploads are not configured` | Fill all `R2_*` vars in `api/.env` and restart API |
| Image uploads but shop shows broken image | Set `NEXT_PUBLIC_IMAGE_HOST` and restart web |
| `403` on upload | Check API token has write access to the bucket |
| CORS errors from browser to R2 | Not needed — browser loads images via `<img>` / Next `Image`; uploads go to your API only |
