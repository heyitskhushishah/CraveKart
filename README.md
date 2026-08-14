# FoodRush — Deliberately Vulnerable Food-Delivery App

A university security-project web app built with **Next.js (App Router) + TypeScript +
Tailwind v4 + Supabase (cloud)**. Every feature is intentionally buggy and maps to a
specific [OWASP Top 10 (2021)](https://owasp.org/Top10/) category. It is designed to be
**demoed, attacked, and explained** — do not deploy this anywhere real.

## Credentials

| Email | Password | Role |
|---|---|---|
| `admin@foodrush.app` | `admin123` | admin |
| `priya@foodrush.app` | `priya123` | customer |
| `alex@foodrush.app` | `alex123` | customer |

Legacy guest (MD5) accounts for the guest login flow: `guest1@foodrush.app` / `guestpass1`.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project keys
npm run db:migrate           # applies supabase/migrations/ to your cloud DB
npm run db:seed-auth         # recreates the demo auth users via the Admin API
npm run dev
```

Notes:

- This repo pins the **webpack** build (`npm run dev` already passes `--webpack`) because
  the machine's Turbopack native binaries are corrupt; the WASM fallback is used.
- Demo auth users are created through the GoTrue **Admin API**
  (`scripts/seed-demo-users.mjs`), **never** by raw SQL — hand-written `auth.users` rows
  break GoTrue login with `Database error querying schema`.

## OWASP Top 10 mapping

### A01: Broken Access Control
- **User enumeration** — `/api/login` probes `users` first and answers "No account found
  with that email" vs "Incorrect password" (`app/api/login/route.ts`).
- **Client-side admin gate** — `/admin` checks `localStorage["foodrush_user"].role`
  only; `/api/admin/users` has no server authorization and dumps all users, coupons and
  orders. Set `foodrush_user` = `{"role":"admin"}` in DevTools to get in.
- **IDOR** — `/orders/[id]` and `/api/orders/[id]` fetch any order (including the stored
  card number) by id, no ownership check.
- **RLS disabled everywhere** — the anon key can read/write every table.
- **Unauthenticated review posting** — `/api/reviews` accepts anything.

### A02: Cryptographic Failures
- **Plaintext card storage** — checkout stores the full PAN in `orders.cc_number`
  (`app/api/checkout/route.ts`).
- **Weak hashing** — `legacy_accounts` stores passwords with unsalted MD5 (migration 003).

### A03: Injection
- **SQLi in search** — `search_items` is a Postgres RPC that builds SQL by string
  concatenation inside `EXECUTE` and is called unmodified via
  `supabase.rpc("search_items", { query })`; search `x' or 1=1--` on `/menu` to
  return all items, or `x' OR '1'='1` on the cart coupon.
  (`app/api/search/route.ts`, `app/api/coupon/route.ts`, migrations 001 & 005.)
- **Stored XSS** — reviews are rendered with `dangerouslySetInnerHTML`. The Classic
  Cheeseburger already has a seeded `<img src=x onerror=...>` review; post your own on
  `/product/[id]`.
- **Path traversal** — `/api/receipt?filename=../../.env.local` reads arbitrary files.

### A04: Insecure Design
- **Client-trusted totals** — checkout trusts the prices/qty sent from the browser; POST
  `{"items":[{"price":0.01,"qty":1}], ...}` and pay ~nothing.

### A05: Security Misconfiguration
- **Webhook with no signature** — `/api/webhook` performs sensitive actions (change order
  status, bump coupon `max_uses`) with no shared-secret verification. The "secret"
  is committed in the client config as `sk_live_webhook_foodrush_2024_001`.

### A07: Identification & Authentication Failures
- **No rate limiting / lockout** — login is a single server-side route, no throttle, so
  brute-force demos are easy (`/api/login`).
- **Weak password rules** — Supabase "min password length" is set to 1 (Dashboard config);
  the register page's strength meter is decorative and always shows green.

### A08: Software & Data Integrity Failures
- **Insecure deserialization / trust of untrusted input** — cart contents and order JSON
  are trusted from the client and replayed into the DB with no integrity check.

### A09: Security Logging & Monitoring Failures
- **Credentials in logs** — `/api/login` logs the full request body, including the
  password, to the server console. No audit trail, no monitoring anywhere.

### A10: Server-Side Request Forgery (SSRF)
- **Tracking proxy** — `/track` + `/api/track?url=...` fetches arbitrary URLs server-side:
  `http://localhost:3000/api/admin/users`, `http://169.254.169.254/latest/meta-data/`,
  or `file:///etc/passwd`.

### Bonus: CSRF (A01 flavor)
- `/profile` changes your email over a **GET** request with no CSRF token and no
  Origin/Referer check — triggerable by `<img src="/api/profile?current=...&email=...">`.

## Suggested demo script

1. **Enumeration**: try `admin@foodrush.app` with a wrong password, then `nobody@x.com` —
   note the different errors. Watch `dev.log` for the password in plaintext.
2. **SQLi**: on `/menu`, search `%' or 1=1--`; on the cart, apply coupon `x' OR '1'='1`.
3. **Stored XSS**: visit the Classic Cheeseburger product page (the seeded payload fires
   `alert(document.cookie)`), then post `<img src=x onerror=alert(1)>` yourself.
4. **IDOR + plaintext card**: place an order with card `4111 1111 1111 1111`, then open
   another order id from `/orders` and read its stored PAN.
5. **Client-side authz**: open `/admin` as a normal customer, then set
   `localStorage.foodrush_user` to `{"role":"admin"}` and reload.
6. **SSRF**: on `/track`, paste `http://localhost:3000/api/admin/users`.
7. **Path traversal**: `/api/receipt?filename=../../.env.local`.
8. **Webhook**: `POST /api/webhook {"coupon_code":"HACKME99","max_uses":999999}`.

## Project structure

- `app/` — pages (`login`, `register`, `menu`, `product/[id]`, `cart`, `orders`,
  `orders/[id]`, `admin`, `track`, `profile`) and API routes (`api/login`,
  `api/search`, `api/coupon`, `api/checkout`, `api/orders`, `api/orders/[id]`,
  `api/product/[id]`, `api/reviews`, `api/admin/users`, `api/track`, `api/receipt`,
  `api/webhook`, `api/profile`).
- `components/` — design-system UI (`ui/`) and auth layout (`auth/AuthShell.tsx`).
- `lib/supabase/` — browser + server clients.
- `supabase/migrations/` — portable SQL migrations for the cloud database.
- `scripts/seed-demo-users.mjs` — recreates demo auth users via the Admin API.
- `public/receipts/` — target files for the path-traversal demo.
