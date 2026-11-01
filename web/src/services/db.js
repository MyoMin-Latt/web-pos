import { get, set } from 'idb-keyval';
export const cacheItems = (items) => set('pos_items', items);
export const getCachedItems = () => get('pos_items');
export const cacheCustomers = (c) => set('pos_customers', c);
export const getCachedCustomers = () => get('pos_customers');
export const getOutbox = async () => (await get('pos_outbox')) || [];
export const addToOutbox = async (invoice) => { const q = await getOutbox(); q.push({ ...invoice, _queuedAt: new Date().toISOString() }); await set('pos_outbox', q); return q.length; };
export const setOutbox = (q) => set('pos_outbox', q);
