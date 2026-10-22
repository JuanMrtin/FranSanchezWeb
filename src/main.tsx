import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import '@fontsource/barlow-condensed/500.css';
import '@fontsource/barlow-condensed/600.css';
import '@fontsource/barlow-condensed/700.css';
import '@fontsource/barlow-condensed/800.css';
import '@fontsource/barlow-condensed/900.css';
import '@fontsource-variable/inter';
import './index.css';
import App from './App.tsx';

const root = document.getElementById('root')!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// En producción el HTML llega prerenderizado: se hidrata. En desarrollo (sin
// prerender) se monta desde cero.
if (root.hasChildNodes()) {
  hydrateRoot(root, app, {
    onRecoverableError: (error) => console.error('[hidratación]', error),
  });
} else {
  createRoot(root).render(app);
}
