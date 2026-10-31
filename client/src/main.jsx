import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Router from './app/router';
import { startSyncEngine } from './services/syncEngine';
import './index.css';
const qc = new QueryClient();
function App() { useEffect(() => startSyncEngine(), []); return <Router />; }
ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><QueryClientProvider client={qc}><App /></QueryClientProvider></React.StrictMode>);
