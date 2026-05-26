# Postman testing guide — nest-next-ecommerce API

> Run with `npm run dev` in `api/`. Base URL: **`http://localhost:3000/api/v1`**

---

## 1. Postman environment

Create environment **`local`**:

| Variable | Initial value |
|----------|----------------|
| `baseUrl` | `http://localhost:3000/api/v1` |
| `accessToken` | *(empty)* |
| `refreshToken` | *(empty)* |
| `categoryId` | *(empty)* |
| `productId` | *(empty)* |
| `orderId` | *(empty)* |
| `adminAccessToken` | *(empty — optional second user)* |

**Collection auth (for protected routes):**  
Authorization → Type: **Bearer Token** → Token: `{{accessToken}}`

Or per-request header: `Authorization: Bearer {{accessToken}}`

---

## 2. Auto-save tokens (Tests tab)

On **Register** or **Login** request → **Tests**:

```javascript
const res = pm.response.json();
if (res.accessToken) {
  pm.environment.set('accessToken', res.accessToken);
  pm.environment.set('refreshToken', res.refreshToken);
}
```

---

## 3. Suggested test order

### Phase 0 — Server

| # | Method | URL | Auth | Expect |
|---|--------|-----|------|--------|
| 0 | GET | `{{baseUrl}}` | No | 200, hello string |

---

### Phase 1 — Auth (public)

| # | Method | URL | Body | Expect |
|---|--------|-----|------|--------|
| 1 | POST | `{{baseUrl}}/auth/register` | See below | 201/200 + tokens + user |
| 2 | POST | `{{baseUrl}}/auth/login` | Same email/password | tokens (if already registered, use login only) |

**Register / Login body:**

```json
{
  "email": "shopper@example.com",
  "password": "Secret1!",
  "firstName": "Shop",
  "lastName": "User"
}
```

| # | Method | URL | Auth | Expect |
|---|--------|-----|------|--------|
| 3 | GET | `{{baseUrl}}/auth/me` | Bearer | 200, user, no password |
| 3b | GET | `{{baseUrl}}/auth/me` | None | **401** |

---

### Phase 2 — Auth (tokens)

| # | Method | URL | Body / Auth | Expect |
|---|--------|-----|-------------|--------|
| 4 | POST | `{{baseUrl}}/auth/refresh` | `{ "refreshToken": "{{refreshToken}}" }` | New tokens → update env |
| 5 | POST | `{{baseUrl}}/auth/logout` | Bearer access | `{ "message": "Logged out successfully" }` |
| 6 | POST | `{{baseUrl}}/auth/refresh` | Old refresh | **401** after logout |

Re-login before catalog/cart if you logged out.

---

### Phase 3 — ADMIN setup

Set one user to **ADMIN** in Prisma Studio: `npx prisma studio` → `users` → `role` = `ADMIN`.

Login as that user → save token as `adminAccessToken` (or replace `accessToken` for admin steps).

| # | Method | URL | Auth | Expect |
|---|--------|-----|------|--------|
| 7 | GET | `{{baseUrl}}/auth/admin-only` | USER token | **403** |
| 8 | GET | `{{baseUrl}}/auth/admin-only` | ADMIN token | **200** |

---

### Phase 4 — Categories

Use **ADMIN** Bearer for writes.

| # | Method | URL | Body | Expect |
|---|--------|-----|------|--------|
| 9 | POST | `{{baseUrl}}/categories` | Below | 201/200, save `id` → `categoryId` |
| 10 | GET | `{{baseUrl}}/categories` | — | List includes new category |

**Create category:**

```json
{
  "name": "Accessories",
  "slug": "accessories",
  "description": "accessory and stuff",
  "isActive": true
}
```

**Tests tab (optional):** `pm.environment.set('categoryId', pm.response.json().id);`

| # | Method | URL | Body | Expect |
|---|--------|-----|------|--------|
| 11 | PATCH | `{{baseUrl}}/categories/{{categoryId}}` | `{ "name": "Electronics & Tech" }` | Updated name |
| 12 | DELETE | `{{baseUrl}}/categories/{{categoryId}}` | — | Deactivate (`isActive: false`) |
| 13 | GET | `{{baseUrl}}/categories` | — | Deactivated hidden |

Create **another** active category before products (repeat step 9 with new slug).

---

### Phase 5 — Products

| # | Method | URL | Body | Expect |
|---|--------|-----|------|--------|
| 14 | POST | `{{baseUrl}}/products` | Below | Save `id` → `productId` |
| 15 | GET | `{{baseUrl}}/products` | — | List + nested `category` |
| 16 | GET | `{{baseUrl}}/products?categoryId={{categoryId}}` | — | Filtered list |

**Create product:**

```json
{
  "name": "Wireless Mouse",
  "sku": "MOUSE-001",
  "price": 29.99,
  "stock": 50,
  "categoryId": "{{categoryId}}",
  "description": "Ergonomic mouse"
}
```

| # | Method | URL | Body | Expect |
|---|--------|-----|------|--------|
| 17 | PATCH | `{{baseUrl}}/products/{{productId}}` | `{ "price": 24.99 }` | Updated |
| 18 | DELETE | `{{baseUrl}}/products/{{productId}}` | — | Deactivate |

Create another **active** product with stock for cart tests if you deactivated the first.

---

### Phase 6 — Cart (shopper token)

Use **normal user** Bearer (`accessToken`), not admin.

| # | Method | URL | Body | Expect |
|---|--------|-----|------|--------|
| 19 | GET | `{{baseUrl}}/cart` | — | Empty or existing cart (**not** `/cart/items`) |
| 20 | POST | `{{baseUrl}}/cart/items` | Below | Cart with line + product |
| 21 | GET | `{{baseUrl}}/cart` | — | `cartItems` with nested `product` |

> **Common mistake:** `GET /cart/items` does **not** exist → **404**. Only `POST /cart/items`. View cart with **`GET /cart`**.

**Add to cart:**

```json
{
  "productId": "{{productId}}",
  "quantity": 2
}
```

| # | Method | URL | Body | Expect |
|---|--------|-----|------|--------|
| 22 | POST | `{{baseUrl}}/cart/items` | Same `productId`, `"quantity": 1` | Qty **3** (merged) |
| 23 | PATCH | `{{baseUrl}}/cart/items/{{productId}}` | `{ "quantity": 1 }` | Qty = 1 |
| 24 | DELETE | `{{baseUrl}}/cart/items/{{productId}}` | — | Line removed |
| 25 | GET | `{{baseUrl}}/cart` | — | `cartItems: []` |
| 26 | GET | `{{baseUrl}}/cart` | No Bearer | **401** |

---

### Phase 7 — Orders (checkout)

**Setup:** Log in as USER, add at least one product to cart (Phase 6, steps 20–21). Save `productId` with stock ≥ 1.

Optional body for checkout:

```json
{
  "shippingAddress": "123 Main St, City"
}
```

**Tests** on checkout (save `orderId`):

```javascript
const res = pm.response.json();
if (res.id) pm.environment.set('orderId', res.id);
```

| # | Method | URL | Body | Expect |
|---|--------|-----|------|--------|
| 27 | POST | `{{baseUrl}}/orders/checkout` | `{ "shippingAddress": "123 Main St" }` or `{}` | **201/200**, `status: PENDING`, `orderItems`, `totalAmount`, cart `checkedOut` via relation |
| 28 | GET | `{{baseUrl}}/orders` | — | Array with the new order |
| 29 | GET | `{{baseUrl}}/orders/{{orderId}}` | — | Same order; includes `orderItems` + `product` |
| 30 | GET | `{{baseUrl}}/cart` | — | New **empty** open cart (`cartItems: []`) |
| 31 | POST | `{{baseUrl}}/orders/checkout` | — | **400** Cart is empty (no lines in new cart) |
| 32 | GET | `{{baseUrl}}/orders/not-a-uuid` | — | **404** Order not found |

**Stock check:** Note product `stock` before checkout; after checkout it should decrease by line `quantity`.

---

## 4. Quick error reference

| Status | Usual cause |
|--------|-------------|
| 400 | Validation failed (password rules, slug, quantity) |
| 401 | Missing/invalid token, wrong login, refresh after logout |
| 403 | Logged in but not ADMIN |
| 404 | Wrong id, category/product not found, cart line missing |
| 409 | Duplicate email or slug or SKU |

---

## 5. Password rules (register/login)

- Min 8 chars  
- Upper + lower + number + special from `@$!%*?&`  
- Example: `Secret1!`

---

## Checklist (printable)

- [ ] Phase 0 — GET root  
- [ ] Phase 1 — register/login/me  
- [ ] Phase 2 — refresh/logout  
- [ ] Phase 3 — admin-only 403 vs 200  
- [ ] Phase 4 — categories CRUD  
- [ ] Phase 5 — products CRUD  
- [ ] Phase 6 — cart add/update/remove  
- [ ] Phase 7 — checkout + list orders + new empty cart  

When all pass, you're ready for **D5 Payments**.
