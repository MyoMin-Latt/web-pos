# Web POS — Project Specification (detailed)

> **Status:** Implemented. This file describes what the code in this repository
> actually does, not just what was originally asked for. Where the code has a
> known gap, the gap is stated plainly in §16 instead of being hidden.
>
> **Repository:** `MyoMin-Latt/web-pos` (private)
>
> **Separate project:** This is a generic retail POS. It is **not** the
> agri-input B POS (`~/workspace/b-pos`, two stores, Fertilizer / Medicine /
> Rice, cash + credit, 4%/month credit ledger, Supabase). Do not merge the
> two apps' models, and do not copy B POS's credit rules into this app.

---

## 1. Purpose

A fast, lightweight, offline-resilient point-of-sale system for a small
retail shop:

1. A cashier can find an item in seconds — by barcode scan, name, or SKU —
   and sell it.
2. A sale is never lost because the internet dropped: it is queued on the
   device and synced automatically when the connection returns.
3. Staff, items, customers, and invoices are managed from the same app, on
   web and on a phone, against one shared server API.
4. An invoice can be dated on a day other than today (back-dated / custom
   invoice date), because shops do not always record a sale on the day it
   happened.

### 1.1 Non-goals (deliberately out of scope)

- No purchases / supplier module, no purchase orders, no goods-receiving.
- No credit sales, instalments, or interest ledger (that belongs to B POS).
- No multi-store / multi-branch stock. Stock is a single quantity per item.
- No dashboard, sales reports, or charts yet (see §16).
- No barcode-label printing, no receipt-printer (ESC/POS) integration —
  receipts use the browser / device print path.
- No tax-rate table or currency conversion. Discount and tax are flat
  amounts entered per sale, and prices are plain numbers with no currency
  code stored.

---

## 2. Users and roles

| Role | Can do |
| --- | --- |
| `admin` | Everything a cashier can, plus create / edit / delete items, and list users (`GET /api/users`). |
| `cashier` | Log in, sell, view items and customers, create / edit / delete customers, view invoices and receipts. Cannot create / edit / delete items (server returns 403). |

There is no manager, owner, or read-only role. There is no self-service
signup restriction: anyone who can reach the server can register an account
(see the security note in §11). In production, restrict registration or
create staff accounts only as admin.

---

## 3. Tech stack

### 3.1 Web client — `web/`

| Layer | Choice | Version in `web/package.json` |
| --- | --- | --- |
| Framework | React + Vite | React 18.3, Vite 5.4 |
| Styling | Tailwind CSS (v4, via `@tailwindcss/vite`) | Tailwind 4.0 |
| Routing | React Router | 6.26 |
| Server state / fetching | TanStack React Query | 5.59 |
| Client state | Zustand | 4.5 |
| HTTP | Axios, with a JWT interceptor | 1.7 |
| Offline storage | IndexedDB via `idb-keyval` | 6.2 |

### 3.2 Mobile client — `expo_mobile/`

| Layer | Choice |
| --- | --- |
| Framework | Expo SDK 58, React Native 0.88, React 19.3 |
| Routing | Expo Router (file-based, `app/`) |
| Server state / fetching | TanStack React Query 5.105 |
| Client state | Zustand 5.0 |
| HTTP | Axios, Bearer token from AsyncStorage |
| Offline storage | AsyncStorage (outbox + item cache) |
| Barcode scan | `expo-camera` 58.0.14 (`CameraView`, Scan screen) |

### 3.3 Server — `server/`

| Layer | Choice | Version in `server/package.json` |
| --- | --- | --- |
| Runtime / framework | Node.js + Express | Express 4.19 |
| Database | MongoDB via Mongoose | Mongoose 8.5 |
| Auth | JSON Web Tokens + bcrypt | `jsonwebtoken` 9.0, `bcryptjs` 2.4 (10 rounds) |
| Config | `dotenv` | 16.4 |
| CORS | `cors`, origin from `CLIENT_URL` | 2.8 |

---

## 4. Repository layout

```text
web-pos/
├── PROJECT_SPEC.md            # this file
├── README.md                  # quick start, demo logins, offline test steps
├── .gitignore                 # node_modules/, dist/, .env, .expo/
│
├── web/                       # React web app (port 5173, proxies /api → :5031)
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── index.css          # Tailwind v4 import + theme, focus, print rules
│       ├── app/               # router.jsx, store.js (Zustand: auth, sync, cart)
│       ├── components/        # Layout.jsx, ProtectedRoute.jsx, ui.jsx
│       ├── services/          # api.js (Axios + JWT), db.js (IndexedDB), syncEngine.js
│       └── features/          # feature modules (see §5)
│           ├── auth/          # LoginPage.jsx, RegisterPage.jsx
│           ├── items/         # ItemsPage.jsx
│           ├── customers/     # CustomersPage.jsx
│           └── invoices/      # PosPage.jsx, InvoiceListPage.jsx, Receipt.jsx
│
├── expo_mobile/               # Expo mobile app (see expo_mobile/README.md)
│   ├── app.json, package.json
│   ├── app/                   # _layout.js, index.js, login.js, register.js,
│   │                          # pos.js, items.js, customers.js, invoices.js, scan.js
│   └── src/                   # components/, config.js, services/, store.js
│
└── server/                    # Express API (port 5031)
    ├── package.json           # start / dev (--watch) / seed
    ├── .env.example           # MONGO_URI, JWT_SECRET, PORT, CLIENT_URL
    └── src/
        ├── server.js          # app wiring, /api/health, route mounting
        ├── config/db.js       # connectDB(), isDbReady()
        ├── store.js           # DEMO in-memory fallback data (see §10)
        ├── seed.js            # seed MongoDB from store.js demo data
        ├── middleware/        # auth.js (JWT + requireRole), errorHandler.js
        └── features/          # one folder per domain, each with Model,
            ├── users/         #   Controller, and Routes (see §7)
            ├── items/
            ├── customers/
            └── invoices/
```

The layout is feature-based on both sides: a feature's UI (web), its API
routes, and its data model live together by domain, not by technical layer.
Shared code lives in `app/`, `components/`, and `services/` (web) or `src/`
(mobile), and in `config/` and `middleware/` (server).

---

## 5. Screens and routes

### 5.1 Web (`web/src/app/router.jsx`)

| Route | Screen | Access |
| --- | --- | --- |
| `/login` | Staff login | Public |
| `/register` | Staff registration | Public |
| `/` | POS Register (the main screen) | Logged in |
| `/items` | Item list, search, create / edit / delete (admin only for writes) | Logged in |
| `/customers` | Customer list, search, create / edit / delete, purchase history | Logged in |
| `/invoices` | Invoice history, tap an invoice for its receipt + print | Logged in |
| anything else | Redirects to `/` | — |

All logged-in screens render inside `Layout`: a sticky, blurred header
with the Web POS mark, pill navigation (the active page is highlighted),
an Online / Offline pill, a pending-sync pill when the offline queue is
non-empty, last-sync time, the signed-in user's name and role, and Logout.

### 5.2 Mobile (`expo_mobile/app/`)

| File | Screen |
| --- | --- |
| `index.js` | Home |
| `login.js`, `register.js` | Staff login / registration |
| `pos.js` | POS register (same cart and checkout shapes as web) |
| `scan.js` | Camera barcode scan; the scanned barcode is handed to the POS screen |
| `items.js`, `customers.js`, `invoices.js` | Item, customer, and invoice management |
| `_layout.js` | Auth gate + a 15-second sync timer |

The mobile app talks to the **same** server API and uses the **same**
cart-line and offline-outbox shapes as the web app, so a sale created on
either client syncs through the same endpoint.

---

## 6. Data models

All models use Mongoose `timestamps` (`createdAt`, `updatedAt`). Field
names below are the exact JSON field names the API accepts and returns.

### 6.1 User — `server/src/features/users/userModel.js`

| Field | Type | Rules |
| --- | --- | --- |
| `name` | String | Required |
| `email` | String | Required, unique, lowercased |
| `passwordHash` | String | Required, bcrypt hash (never a plain password) |
| `role` | String | `admin` or `cashier`, default `cashier` |

### 6.2 Item — `server/src/features/items/itemModel.js`

| Field | Type | Rules |
| --- | --- | --- |
| `name` | String | Required |
| `sku` | String | Required, unique (the shop's own code, e.g. `RICE-5KG`) |
| `barcode` | String | Optional, default `''` (the scanned code, e.g. `890100001`) |
| `category` | String | Default `General` |
| `price` | Number | Required, minimum 0 |
| `stock` | Number | Default 0, minimum 0 (at the model level) |
| `lowStockAt` | Number | Default 5 — stock at or below this shows a "Low stock" badge |

`sku` and `barcode` are different things and both are searchable: `sku` is
the human code, `barcode` is what the scanner reads.

### 6.3 Customer — `server/src/features/customers/customerModel.js`

| Field | Type | Rules |
| --- | --- | --- |
| `name` | String | Required |
| `phone` | String | Default `''` |
| `email` | String | Default `''` |
| `address` | String | Default `''` |

### 6.4 Invoice — `server/src/features/invoices/invoiceModel.js`

| Field | Type | Rules |
| --- | --- | --- |
| `invoiceNo` | String | Required, unique. Format `INV-00001`, `INV-00002`, … (see §8.3) |
| `customer` | ObjectId → Customer | Nullable (walk-in sales have no customer) |
| `customerName` | String | Default `Walk-in` (kept as a snapshot, so a renamed / deleted customer does not rewrite history) |
| `items[]` | Embedded lines | Each line: `item` (ObjectId → Item), `name`, `sku`, `price`, `qty`. Prices are snapshotted at sale time. |
| `subtotal` | Number | Sum of `price × qty` over lines (computed server-side) |
| `discount` | Number | Default 0, flat amount (not a percentage) |
| `tax` | Number | Default 0, flat amount (not a percentage) |
| `total` | Number | `max(0, subtotal − discount + tax)` (computed server-side) |
| `paymentMethod` | String | `cash` or `card`, default `cash` |
| `invoiceDate` | Date | Default now; may be set to any date by the client (custom invoice date) |
| `cashier` | String | Name of the signed-in user who made the sale (`req.user.name`) |
| `source` | String | `online` or `offline-sync` — a sale that arrived via the offline queue is marked `offline-sync` |

---

## 7. API reference

Base URL: web uses `/api` (Vite proxies it to the server); mobile uses
`EXPO_PUBLIC_API_URL` (default `http://localhost:5031`).

**Authentication:** every endpoint except `POST /api/users/register`,
`POST /api/users/login`, and `GET /api/health` requires
`Authorization: Bearer <JWT>`. Missing token → 401. Wrong role → 403.
Unknown route → 404 via `notFound`. Errors go through `errorHandler`.

| Method & path | Auth | Body / query | Behaviour |
| --- | --- | --- | --- |
| `GET /api/health` | Public | — | `{ ok: true, mode: "mongodb" \| "demo-memory", mongoConnected: bool, time }` (see §10) |
| `POST /api/users/register` | Public | `{ name, email, password, role? }` | Creates a user, returns `{ user, token }` |
| `POST /api/users/login` | Public | `{ email, password }` | Verifies bcrypt hash, returns `{ user, token }` |
| `GET /api/users/me` | Any login | — | Returns the token's user |
| `GET /api/users` | Admin | — | Lists users |
| `GET /api/items?search=` | Any login | `search` matches name, barcode, or SKU (case-insensitive, partial) | Sorted by name. In demo-memory mode the same match is done in code |
| `POST /api/items` | Admin | Item fields (§6.2) | 201 with the created item |
| `PUT /api/items/:id` | Admin | Item fields | Updated item, or 404 |
| `DELETE /api/items/:id` | Admin | — | `{ ok: true }` |
| `GET /api/customers?search=` | Any login | `search` matches name or phone | Sorted by name |
| `POST /api/customers` | Any login | Customer fields (§6.3) | 201 |
| `PUT /api/customers/:id` | Any login | Customer fields | Updated customer, or 404 |
| `DELETE /api/customers/:id` | Any login | — | `{ ok: true }` |
| `GET /api/customers/:id/history` | Any login | — | That customer's invoices, newest invoice date first |
| `GET /api/invoices` | Any login | — | Up to 200 invoices, newest invoice date first |
| `POST /api/invoices` | Any login | See §8.1 | 201 with the created invoice (see §8.3 for numbering and stock) |
| `GET /api/invoices/:id` | Any login | — | One invoice, or 404 |

There is no `PUT` / `DELETE` for invoices: a recorded sale is never edited
or deleted through the API. To correct a sale, record a new correcting
invoice (a future feature could add void / return — see §16).

---

## 8. Business rules

### 8.1 Checkout payload (web + mobile share this shape)

```json
{
  "customerId": "<ObjectId or null>",
  "customerName": "Walk-in",
  "items": [{ "item": "<ObjectId>", "name": "Rice 5kg", "sku": "RICE-5KG", "price": 12500, "qty": 2 }],
  "discount": 500,
  "tax": 0,
  "paymentMethod": "cash",
  "invoiceDate": "2026-10-30",
  "source": "online"
}
```

The server recomputes `subtotal` and `total` from the lines — it does not
trust a total sent by the client. The client-side total shown in the cart
uses the same formula, so the two agree.

### 8.2 The POS flow (web)

1. The cashier scans a barcode or types a name / SKU. Search is debounced
   (200 ms on the POS screen, 250 ms on the Items screen) and matches
   name, barcode, or SKU.
2. If the search returns exactly one item and the cashier presses Enter,
   that item is added immediately — no mouse needed.
3. Adding an item already in the cart increases its quantity instead of
   adding a duplicate line. Quantity buttons increase / decrease; reaching
   0 removes the line.
4. The cashier optionally picks a customer (default: Walk-in), sets a
   custom invoice date (default: today), discount, tax, and payment
   (cash / card).
5. Checkout posts the payload in §8.1. On success the receipt is shown
   with a Print button (`window.print()`; the header and cart are hidden
   in print via the `no-print` class). On failure — e.g. the server is
   unreachable — the sale is queued offline instead (see §9) and a
   receipt is still shown, with an `OFFLINE-<timestamp>` number until it
   syncs and gets a real `INV-…` number.

### 8.3 Invoice numbering and stock

- **Numbering:** `INV-` + the invoice count + 1, zero-padded to 5 digits
  (`INV-00001`). In MongoDB mode the count is `Invoice.countDocuments()`;
  in demo-memory mode it is the in-memory list length + 1. Note: this is
  not safe against two simultaneous checkouts producing the same number —
  a unique-index violation is possible under concurrency (see §16).
- **Stock:** after a sale is created, each line's item stock is reduced by
  the line quantity (`$inc: { stock: -qty }` in MongoDB mode). The
  demo-memory path clamps stock at 0; the MongoDB path does **not** clamp
  and does **not** refuse a sale that would take stock negative. Stock is
  therefore a record of what was sold, not a hard availability gate.
- **Snapshots:** item `name`, `sku`, and `price` are copied into the
  invoice line at sale time, so later price changes do not rewrite old
  invoices.

### 8.4 Search and low stock

- Item search is a partial, case-insensitive match on name, barcode, and
  SKU — a barcode scan is just a search that happens to match one item.
- An item shows "Low stock" when `stock <= lowStockAt` (default 5). This
  is a warning only; it does not block a sale.

---

## 9. Offline resilience

This is the feature the whole system is built around, so the rules are
exact:

### 9.1 Web

- **Cache keys (IndexedDB, via `idb-keyval`, `web/src/services/db.js`):**
  `pos_items` (last item list), `pos_customers` (last customer list),
  `pos_outbox` (queued invoices).
- **Reading while offline:** item and customer queries fall back to the
  cached lists when the API call fails. The cache is refreshed on every
  successful fetch, but only when the POS search box is empty (for items)
  — a filtered search does not overwrite the full cache.
- **Writing while offline:** if checkout fails, the payload is appended
  to `pos_outbox` with a `_queuedAt` timestamp, the pending count in the
  header increases, and the sale is **not** lost. The cart is then
  cleared, exactly as in the online path.
- **Sync (`web/src/services/syncEngine.js`):** runs on app start, on the
  browser `online` event, and every 15 seconds. For each queued invoice
  it strips `_queuedAt`, posts it with `source: "offline-sync"`, and
  removes it from the queue **only after the server returns 201**. A
  failed post leaves that invoice in the queue for the next attempt.
  `lastSync` updates only when at least one queued invoice was cleared.
- **Limits (honest):**
  - Login needs the server the first time (a JWT cannot be issued
    offline). Offline selling works after a login and a cache fill.
  - The cart itself is in-memory Zustand state, not persisted: refreshing
    the page mid-sale loses the unsold cart (a queued, checked-out sale
    is safe; an un-checked-out cart is not).
  - The offline flow is implemented and documented but has not been
    live-browser-tested end to end (DevTools offline → sell → online →
    pending drops to 0) — try that before relying on it in a shop.

### 9.2 Mobile

Same rules, with AsyncStorage instead of IndexedDB, plus a "Sync now"
button. Sync runs on app start, every 15 seconds, and on demand. The
mobile README documents the phone-to-server connection (a physical phone
must use the Mac's LAN IP, not `localhost`).

---

## 10. Demo-memory mode and seeding

The server is designed to stay up even without MongoDB:

- If `MONGO_URI` is unset or unreachable (5-second selection timeout),
  `connectDB()` logs a warning and the server runs in **demo-memory**
  mode: `server/src/store.js` holds 2 demo users, 12 demo items
  (Rice, Fertilizer, Medicine, Grocery — barcodes `890100001`–`890100012`),
  and 5 demo customers. `/api/health` reports `mode: "demo-memory"` and
  `mongoConnected: false` — it never pretends MongoDB is connected.
- In demo-memory mode all data lives in server memory and **resets on
  restart**. Do not use it for real shop sales.
- `npm run seed` (server) copies the same demo data into MongoDB. It
  **wipes** the `users`, `items`, and `customers` collections first
  (invoices are not wiped) and skips gracefully if MongoDB is
  unreachable. Demo accounts are listed in `README.md` (sample only —
  change them in production).

---

## 11. Configuration and security

### 11.1 Environment variables (`server/.env`, see `.env.example`)

| Variable | Default | Meaning |
| --- | --- | --- |
| `MONGO_URI` | *(unset → demo-memory)* | MongoDB connection string, e.g. `mongodb://127.0.0.1:27017/webpos` |
| `JWT_SECRET` | `dev-secret-change-me` (fallback in code) | Secret used to sign JWTs — **must** be set to a long random value in production; the fallback is not a secret |
| `PORT` | `5031` | Server port (5031, not 5000 — 5000 collides with macOS AirPlay Receiver) |
| `CLIENT_URL` | `http://localhost:5173` | CORS origin for the web app |

Mobile: `EXPO_PUBLIC_API_URL` (default `http://localhost:5031`;
on a physical phone use `http://<Mac-LAN-IP>:5031`).

### 11.2 Security notes

- Passwords are bcrypt-hashed (10 rounds) and never stored or returned
  in plain text. The `passwordHash` field is not sent to clients by the
  login / register responses (they return a `user` object built by the
  controller — verify this before exposing a user-list endpoint widely).
- JWTs are sent as `Bearer` tokens and stored in `localStorage` (web) /
  AsyncStorage (mobile). There are no refresh tokens and no token
  revocation list: a token is valid until it expires (see the controller
  for the current expiry), and logout only clears it on the device.
- Registration is open (see §2). CORS allows only `CLIENT_URL` for
  browser clients; native mobile apps send no `Origin` header, so CORS
  does not block them.
- `.env` is git-ignored. Only `.env.example` (placeholder values) is
  committed. Never commit a real `MONGO_URI` or `JWT_SECRET`.

---

## 12. UI design system (web, modern redesign 2026-10-31)

- **Theme:** clean light background (`#f4f5f7`), white surfaces, slate
  text, indigo (`indigo-600`) as the primary action colour.
- **Shape:** rounded-2xl cards, rounded-xl inputs and buttons, rounded-full
  nav pills and status badges. Soft shadows (`shadow-sm`), no heavy
  borders.
- **Header:** sticky, white with backdrop blur, logo mark + "Web POS /
  Retail register", active-page pill navigation, Online / Offline and
  pending-sync pills, user chip (initial + name + role), Logout.
- **POS page:** large search input, item cards that highlight on hover,
  sticky cart on large screens with a shaded total panel (subtotal +
  prominent indigo total).
- **Shared components (`web/src/components/ui.jsx`):** `Btn` (primary /
  secondary / danger / ghost variants, classes merge instead of
  overwriting), `Input`, `Select`, `Card`, `Badge` (slate / green / red /
  amber / indigo), `PageHeader`, `Field`.
- **Print:** `.no-print` hides the header and cart when printing a
  receipt; the receipt itself is a centred white card with dashed
  separators.

No logic changed in the redesign — same auth, search, cart, checkout,
and offline queue, only presentation.

---

## 13. How to run

```bash
# Terminal 1 — server (port 5031)
cd web-pos/server
cp .env.example .env   # then edit MONGO_URI / JWT_SECRET if you have MongoDB
npm install
npm run seed           # only with a real MongoDB; skips gracefully without one
npm start

# Terminal 2 — web (port 5173, proxies /api to :5031)
cd web-pos/web
npm install
npm run dev

# Terminal 3 — mobile (optional)
cd web-pos/expo_mobile
npm install
npx expo start         # open in Expo Go; on a physical phone use
                       # EXPO_PUBLIC_API_URL=http://<Mac-LAN-IP>:5031
```

Verify the server with `curl http://localhost:5031/api/health` — it
should return `ok: true` and tell you honestly whether it is in
`mongodb` or `demo-memory` mode.

---

## 14. Verification done so far

- Web client production build passes (Vite, 165 modules).
- Server starts in demo-memory mode and in MongoDB mode; `/api/health`
  and demo-admin login verified by curl.
- Offline queue logic reviewed in code (web `syncEngine.js`, mobile
  sync): queued invoices are removed only on server 201.
- Expo mobile bundle builds (`expo export --platform android`, 2.8 MB)
  and `expo-doctor` passes 20/20.
- **Not yet verified:** the offline sell-then-sync flow in a real
  browser, and any flow on a physical phone (mobile has only been
  bundle-checked, not run on a device). Try one login, one sale, and one
  offline sale on the target device and report what you see.

---

## 15. History (short)

- **2026-10-31 — MVP:** React + Tailwind web client, Express + Mongoose
  server, auth / items / customers / invoices, barcode search, custom
  invoice date, receipt printing, offline IndexedDB queue.
- **2026-10-31 — Port 5031:** server default, web proxy, `.env.example`,
  README, and login hint changed from 5000 to 5031 (macOS AirPlay
  collision).
- **2026-10-31 — Modern UI:** the redesign in §12, client only.
- **2026-10-31 / 11-01 — Restructure + mobile:** `client/` renamed to
  `web/`; Expo mobile app added under `expo_mobile/` (SDK 58, Expo
  Router, camera barcode scan, same API and offline shapes as web).

---

## 16. Known limitations and future work

In priority order, as they would actually bite a shop:

1. **No stock gate and no concurrency safety.** A sale can take stock
   negative in MongoDB mode, and two simultaneous sales can collide on
   `INV-…` numbering (§8.3). Fix with a stock check + atomic decrement
   and a counter collection for invoice numbers.
2. **Cart is not persisted.** Refreshing mid-sale loses the cart (§9.1).
   Persist the cart to IndexedDB / AsyncStorage.
3. **No void / return / correction.** Invoices cannot be edited or
   deleted via the API (§7). Add a void or credit-note flow.
4. **No reports.** No daily sales total, no best-sellers, no
   per-cashier or per-customer totals beyond single-customer history.
5. **No pagination / filtering on invoices** beyond the 200-item limit,
   and no date-range or payment-method filter.
6. **Open registration** (§2, §11) and no password-reset flow.
7. **No token refresh / revocation** (§11).
8. **No purchases, credit, multi-store, or dashboard** — see §1.1.
   If any of these become requirements, they are new features, not
   bug fixes, and should be specced separately (B POS already covers
   credit and multi-store for the agri shop — do not duplicate it here
   by accident).
