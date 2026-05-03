import { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import App from './app/app';
import './styles.css';

export default function mountHome(el: HTMLElement | string) {
  const container = typeof el === 'string' ? document.querySelector(el) : el;
  if (!container) {
    throw new Error('Home MFE mount point not found');
  }

  const root: Root = createRoot(container);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );

  return () => root.unmount();
}
