# Web POS — Mobile (Expo, SDK 58)

React Native mobile app for the same Web POS server. Same features as the
web app: staff login/register, items, customers, POS register, invoices,
and the offline queue that syncs automatically when back online.

Navigation is file-based with Expo Router (`app/`). Shared logic lives in
`src/` (API client, stores, offline sync) and mirrors the web app's shapes
so the two clients stay compatible.

## Run

```bash
# Terminal 1 — server (port 5031, from the repo root)
cd ../server
npm install
npm start

# Terminal 2 — mobile
cd expo_mobile
npm install
npx expo start
```

Then open the **Expo Go** app on your phone and scan the QR code from the
terminal.

## Connecting the phone to the server

`localhost` on a phone means the phone itself, not your Mac. So:

- **iOS simulator:** `http://localhost:5031` works as-is.
- **Physical phone (same Wi-Fi as your Mac):** start Expo with your Mac's
  LAN IP, e.g.
  ```bash
  EXPO_PUBLIC_API_URL=http://192.168.1.10:5031 npx expo start
  ```
  (Replace `192.168.1.10` with your Mac's IP. Find it in System Settings →
  Network, or with `ipconfig getifaddr en0`.)

The server must be running on port 5031, and the phone must be on the same
Wi-Fi network.

## Features

- Staff login / register (same accounts as web; demo: `admin@pos.local` /
  `Admin123!`, `cashier@pos.local` / `Cashier123!`)
- POS register: search items, add to cart, pick a customer, discount / tax,
  cash / card, custom invoice date, checkout
- Barcode scanning with the camera (Scan button on the POS screen)
- Items and customers: create / edit / delete (item editing is admin-only,
  same as web), customer purchase history
- Invoices / history with receipt view
- Offline: if the server is unreachable, a sale is queued on the device
  (never deleted until the server confirms it) and syncs automatically on
  app start, every 15s, or via "Sync now". Item search also falls back to
  the last cached item list while offline.

## Notes

- Native apps send no `Origin` header, so the server's CORS setting does
  not block them.
- Camera permission is requested on the Scan screen; the camera config
  plugin in `app.json` covers future dev builds (Expo Go already includes
  `expo-camera`).
- This app has been verified to bundle cleanly (`npx expo export`), but
  has not yet been run on a physical phone — try login, one sale, and one
  offline sale on your device and report what you see.
