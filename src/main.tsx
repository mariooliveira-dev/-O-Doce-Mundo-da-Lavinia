import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { initSmartCacheStrategy } from './utils/cacheManager';
import App from './App.tsx';
import './index.css';

// Purga caches obsoletos ao iniciar o aplicativo
initSmartCacheStrategy();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);

