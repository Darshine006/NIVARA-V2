import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Context Providers
import { LanguageProvider } from './context/LanguageContext';
import { RegionProvider } from './context/RegionContext';
import { AuthProvider } from './context/AuthContext';
import { OfflineSyncProvider } from './context/OfflineSyncContext';

// Register Service Worker for PWA Offline Caching
if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'development') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[PWA] ServiceWorker registered with scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('[PWA] ServiceWorker registration failed:', err);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <RegionProvider>
          <AuthProvider>
            <OfflineSyncProvider>
              <App />
            </OfflineSyncProvider>
          </AuthProvider>
        </RegionProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);
