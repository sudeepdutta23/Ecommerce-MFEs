import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { type MountFn } from '@ecom/types';
import App from './App';

/**
 * Framework-agnostic entry point (exposed as './mount').
 *
 * Lets non-React hosts — or hosts that don't want to share a router — embed
 * this MFE by handing over a DOM element. Routing is memory-based so it never
 * fights the host's URL.
 */
export const mount: MountFn = (element, options = {}) => {
  const root = createRoot(element);
  root.render(
    <StrictMode>
      <MemoryRouter initialEntries={[options.initialPath ?? '/']}>
        <App />
      </MemoryRouter>
    </StrictMode>,
  );
  return () => root.unmount();
};
