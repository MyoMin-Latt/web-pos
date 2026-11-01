import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'pos_token';
const USER_KEY = 'pos_user';
const OUTBOX_KEY = 'pos_outbox';
const ITEMS_CACHE_KEY = 'pos_items';

async function getJson(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

async function setJson(key, value) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export const getToken = () => AsyncStorage.getItem(TOKEN_KEY);
export const setToken = (token) => AsyncStorage.setItem(TOKEN_KEY, token);
export const getUser = () => getJson(USER_KEY, null);
export const setUser = (user) => setJson(USER_KEY, user);
export async function clearAuth() {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
}

// Offline outbox: same shape as the web app. An entry is never removed
// until the server confirms it (see sync.js).
export const getOutbox = () => getJson(OUTBOX_KEY, []);
export const setOutbox = (queue) => setJson(OUTBOX_KEY, queue);
export async function queueInvoice(payload) {
  const queue = await getOutbox();
  queue.push({ ...payload, _queuedAt: new Date().toISOString() });
  await setOutbox(queue);
  return queue.length;
}

// Item cache so the POS register can still sell while offline.
export const getCachedItems = () => getJson(ITEMS_CACHE_KEY, []);
export const setCachedItems = (items) => setJson(ITEMS_CACHE_KEY, items);
