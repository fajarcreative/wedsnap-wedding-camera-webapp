import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider } from './context/AppContext';
import { AppContent } from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

function mountWedSnap() {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', mountWedSnap, { once: true });
    } else {
      setTimeout(mountWedSnap, 50);
    }
    return;
  }

  // Prevent multiple mounting
  if ((window as any).__WEDSNAP_MOUNTED__) return;
  (window as any).__WEDSNAP_MOUNTED__ = true;

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <AppProvider>
            <AppContent />
          </AppProvider>
        </ErrorBoundary>
      </React.StrictMode>
    );
  } catch (err) {
    console.error('Fatal mount error:', err);
    rootElement.innerHTML = `
      <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#fbf9f6;color:#1b1c1a;padding:24px;text-align:center;font-family:sans-serif;">
        <h2 style="color:#775a19;margin-bottom:8px;font-size:20px;font-weight:700;">WedSnap</h2>
        <p style="font-size:14px;color:#666;margin-bottom:20px;max-width:280px;line-height:1.5;">Ketuk tombol di bawah untuk membuka aplikasi kamera pernikahan.</p>
        <button onclick="window.location.reload(true)" style="background:#775a19;color:#fff;border:none;padding:12px 24px;border-radius:14px;font-weight:600;font-size:14px;cursor:pointer;box-shadow:0 4px 12px rgba(119,90,25,0.25);">Buka WedSnap</button>
      </div>
    `;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountWedSnap, { once: true });
} else {
  mountWedSnap();
}

