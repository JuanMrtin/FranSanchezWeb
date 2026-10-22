// Prerenderiza la página en el HTML de producción (SSG de una sola ruta).
// Se ejecuta tras `vite build`: compila el entry de servidor con Vite, genera el
// marcado de <App /> y lo inyecta en dist/index.html. Si algo falla, la web
// sigue funcionando (el cliente la monta desde cero) y el build falla en alto.
import { readFile, writeFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';

const raiz = process.cwd();
const dist = resolve(raiz, 'dist');
const ssr = resolve(raiz, 'dist-ssr');

try {
  await build({
    logLevel: 'warn',
    build: {
      ssr: 'src/entry-server.tsx',
      outDir: ssr,
      emptyOutDir: true,
      copyPublicDir: false,
      minify: false,
    },
  });

  const { render } = await import(pathToFileURL(resolve(ssr, 'entry-server.js')).href);
  const marcado = render();

  const rutaHtml = resolve(dist, 'index.html');
  const html = await readFile(rutaHtml, 'utf8');
  if (!html.includes('<div id="root"></div>')) {
    throw new Error('No se encontró <div id="root"></div> en dist/index.html');
  }
  await writeFile(rutaHtml, html.replace('<div id="root"></div>', `<div id="root">${marcado}</div>`));
  console.log(`✓ prerender: ${(marcado.length / 1024).toFixed(0)} KB de HTML inyectados en dist/index.html`);
} finally {
  await rm(ssr, { recursive: true, force: true });
}
