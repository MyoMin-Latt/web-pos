// API address for the phone / emulator running this app.
// - iOS simulator or Expo web: http://localhost:5031 works.
// - Physical phone (Expo Go): localhost means the phone itself, so start
//   expo with your Mac's LAN IP instead, e.g.:
//     EXPO_PUBLIC_API_URL=http://192.168.1.10:5031 npx expo start
//   (replace 192.168.1.10 with your Mac's IP; the server must be running
//   on port 5031 and the phone must be on the same Wi-Fi.)
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5031';
export const API_BASE = `${API_URL}/api`;
