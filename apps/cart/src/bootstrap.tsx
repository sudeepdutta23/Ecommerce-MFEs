import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/index.css';

/** Standalone entry for independent local dev (http://localhost:3004). */
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element #root not found');
}

createRoot(container).render(
  <StrictMode>
    <div className="min-h-screen bg-surface-muted font-sans">
      <div className="border-b border-amber-200 bg-amber-50 px-6 py-2 text-center text-xs font-medium text-warning">
        cart · standalone development mode
      </div>
      <main className="mx-auto max-w-content px-6 py-8">
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </main>
    </div>
  </StrictMode>,
);
