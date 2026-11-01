import api from './api';
import { getOutbox, setOutbox } from './storage';
import { useSync } from '../store';

// Auto-syncs queued offline invoices. Never deletes a queued invoice
// until the server confirms it (HTTP 2xx). Mirrors web syncEngine.js,
// minus the browser online/offline events: this runs on app start,
// on a 15s timer (see App.js), and whenever the user taps "Sync now".
export async function syncOutbox() {
  const sync = useSync.getState();
  const queue = await getOutbox();
  sync.setPending(queue.length);
  if (!queue.length) return;
  const remaining = [];
  for (const inv of queue) {
    try {
      const { _queuedAt, ...payload } = inv;
      await api.post('/invoices', { ...payload, source: 'offline-sync' });
    } catch {
      remaining.push(inv);
    }
  }
  await setOutbox(remaining);
  sync.setPending(remaining.length);
  if (remaining.length < queue.length) sync.setLastSync(new Date().toISOString());
}
