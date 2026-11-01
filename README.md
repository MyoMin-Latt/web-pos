# Web POS — React + Tailwind & Node.js + MongoDB

A fast, lightweight, offline-resilient POS. Feature-based layout exactly as specified.
Separate project from `~/workspace/b-pos` (the agri-input B POS MVP) — nothing there was touched.

Full detailed specification (models, API, business rules, offline sync, limitations): see `PROJECT_SPEC.md`.

## What was built
- **Auth:** register/login, JWT + bcrypt, roles `admin` / `cashier`, protected routes, staff login.
- **Items:** CRUD (admin only for write), stock, price, category, barcode, debounced instant search by name/barcode/SKU, low-stock indicator, keyboard-friendly (autofocus + Enter adds sole match).
- **Customers:** CRUD, search, per-customer purchase history (`GET /customers/:id/history`).
- **Invoices / POS:** cart add/remove/qty, totals, discount/tax, cash/card, customer attach, **custom invoice date picker** (not just today), checkout, receipt view + `window.print()`, invoice list/history.
- **Offline resilience:** IndexedDB (`idb-keyval`) caches items/customers, queues invoices created offline in an outbox, `syncEngine.js` auto-syncs on the `online` event and every 15s. Header shows Online/Offline + Pending sync count. A queued invoice is only removed after the server confirms it (201) — an offline sale is never lost.
- **Server:** Mongoose models, controllers, routes for users/items/customers/invoices, auth middleware, error handler, `.env.example`, seed script.
- **UI (modern, 2026-10-31):** clean light theme, sticky blurred header with active-nav pills, rounded-2xl cards, indigo primary actions, pill badges for stock/payment/sync status, sticky cart on the POS page, and a centered branded login. No logic changed — same auth, search, cart, checkout, and offline queue.

## Server without MongoDB (important, honest label)
The server **starts even if MongoDB is unreachable**: it logs a clear warning and stays up with `/api/health` responding `mode: "demo-memory"`. In that mode it serves the same demo data from an in-memory store (labelled `demo-memory` in health) so the app is demoable. It never claims Mongo is connected when it isn't. For real persistence, set a real `MONGO_URI` and restart — then health reports `mode: "mongodb"`.

## Run (server first, then web)
```bash
# Terminal 1 — server (port 5031)
cd ~/workspace/web-pos/server
cp .env.example .env   # then edit MONGO_URI / JWT_SECRET if you have MongoDB
npm install
npm run seed   # only needed with a real MongoDB; skips gracefully without one
npm start

# Terminal 2 — web (port 5173, proxies /api to :5031)
cd ~/workspace/web-pos/web
npm install
npm run dev
```

## Demo logins (demo/sample only — change in production)
- Admin: `admin@pos.local` / `Admin123!`
- Cashier: `cashier@pos.local` / `Cashier123!`

## Offline test steps
1. Log in while online (so items/customers cache into IndexedDB).
2. Go offline (browser DevTools → Network → Offline, or disable network).
3. Sell from the POS register — you will see "Offline: sale queued locally (N pending)" and the header shows Offline + Pending count. The receipt still shows.
4. Go back online — syncEngine fires on the `online` event (and every 15s) and posts the queued invoice; Pending drops to 0. Check it under Invoices.
5. Note: login itself needs the server the first time (JWT); offline selling works after a login + cache.

## Folders

- `web/` — React web app (port 5173, proxies `/api` to :5031)
- `server/` — Express + Mongoose API (port 5031)
- `expo_mobile/` — Expo (SDK 58) mobile app, same features as web. See
  `expo_mobile/README.md` — on a physical phone, start Expo with
  `EXPO_PUBLIC_API_URL=http://<your-Mac-LAN-IP>:5031` so the phone can
  reach the server.

## What still needs the user
- A real `MONGO_URI` (local MongoDB or Atlas) in `server/.env` for durable, multi-device data. Without it, data lives only in server memory and resets on restart.
- A production `JWT_SECRET` (never ship the `.env.example` placeholder).
