import api from './api';
import { getOutbox, setOutbox } from './db';
import { useSync } from '../app/store';
// Auto-syncs queued offline invoices. Never deletes a queued invoice until the server confirms it (201).
export async function syncOutbox() {
  const set = useSync.getState();
  let queue = await getOutbox();
  set.setPending(queue.length);
  if (!navigator.onLine || !queue.length) return;
  const remaining = [];
  for (const inv of queue) {
    try { const { _queuedAt, ...payload } = inv; await api.post('/invoices', { ...payload, source: 'offline-sync' }); }
    catch (e) { remaining.push(inv); }
  }
  await setOutbox(remaining);
  set.setPending(remaining.length);
  if (remaining.length < queue.length) set.setLastSync(new Date().toISOString());
}
export function startSyncEngine() {
  const update = () => { useSync.getState().setOnline(navigator.onLine); if (navigator.onLine) syncOutbox(); };
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  const timer = setInterval(syncOutbox, 15000);
  syncOutbox();
  return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); clearInterval(timer); };
}
