import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App.tsx';

// Prerenderizado en build (scripts/prerender.mjs): el HTML que reciben los
// buscadores y los usuarios ya contiene todo el contenido; el cliente lo
// «hidrata» después. En desarrollo no se usa.
export function render(): string {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
