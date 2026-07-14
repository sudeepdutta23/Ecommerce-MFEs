import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { type MountFn } from '@ecom/types';
import App from './App';

/** Framework-agnostic entry point (exposed as './mount'). */
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
