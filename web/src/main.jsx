import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Router from './app/router';
import { startSyncEngine } from './services/syncEngine';
import './index.css';
const qc = new QueryClient();
// PWA: register the service worker only in production builds, so dev
// reloads are never served stale. First online load installs it; after
// that the cached app shell opens offline and the IndexedDB outbox
// keeps handling sales until sync.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Offline-capable shell unavailable (e.g. non-secure context);
      // the app still works online and queues sales in IndexedDB.
    });
  });
}
function App() { useEffect(() => startSyncEngine(), []); return <Router />; }
ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><QueryClientProvider client={qc}><App /></QueryClientProvider></React.StrictMode>);
