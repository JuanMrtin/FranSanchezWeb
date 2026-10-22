import { writeFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type HtmlTagDescriptor, type Plugin } from 'vite';
import { INFO_EMPRESA } from './src/data/empresa.ts';
import { SERVICIOS } from './src/data/servicios.ts';

/** Devuelve la línea solo si se cumple la condición (para componer bloques de <head>). */
const si = (cond: unknown, linea: string): string | null => (cond ? linea : null);

const escapaHtml = (t: string) =>
  t.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

/**
 * SEO generado desde los datos reales de la empresa (src/data/*), sin duplicar
 * textos a mano en index.html:
 *
 * - title, description, Open Graph, Twitter y datos estructurados (JSON-LD).
 * - Con `VITE_SITE_URL`: canonical, og:url, URLs absolutas de imagen, sitemap.xml
 *   y línea Sitemap en robots.txt. Muchos rastreadores (WhatsApp, LinkedIn…)
 *   ignoran las imágenes con ruta relativa, así que hay que definirla antes
 *   de publicar.
 * - Con `localidad` / `provincia` en INFO_EMPRESA: se añaden al título, a la
 *   descripción y al JSON-LD (el factor más fuerte del SEO local).
 * - Con `VITE_GOOGLE_SITE_VERIFICATION`: etiqueta de verificación de Search Console.
 * - Precarga de las fuentes críticas del primer pliegue (solo en build).
 *
 * Solo usa información acreditada: no inventa dirección, horario, precios ni zona.
 */
function seoDelSitio(): Plugin {
  let base = '';
  let verificacion = '';
  let outDir = '';
  let esSsr = false;

  // Zona de trabajo en texto («El Saucejo y alrededores»); es la palabra clave del SEO local
  const zona = INFO_EMPRESA.localidad ? `${INFO_EMPRESA.localidad} y alrededores` : INFO_EMPRESA.provincia;
  const titulo = zona ? `Excavaciones en ${zona} | Fran Sánchez` : 'Excavaciones y Movimientos de Tierra | Fran Sánchez';
  const descripcion =
    `Excavaciones y movimientos de tierra${zona ? ` en ${zona}` : ''}: cimentaciones, piscinas, demolición ` +
    `y limpieza de solares. Presupuesto en el ${INFO_EMPRESA.telefono}.`;
  const alt = 'Fran Sánchez Excavaciones: logotipo y retroexcavadora trabajando en una zanja';

  const telefono = INFO_EMPRESA.telefonoHref.replace('tel:', '');
  const abs = (ruta: string) => `${base}${ruta}`;

  function jsonLd(): string {
    const direccion =
      INFO_EMPRESA.localidad || INFO_EMPRESA.provincia
        ? {
            '@type': 'PostalAddress',
            ...(INFO_EMPRESA.localidad && { addressLocality: INFO_EMPRESA.localidad }),
            ...(INFO_EMPRESA.provincia && { addressRegion: INFO_EMPRESA.provincia }),
            addressCountry: 'ES',
          }
        : undefined;
    const zonas = INFO_EMPRESA.zonasActuacion?.length
      ? INFO_EMPRESA.zonasActuacion
      : zona
        ? [zona]
        : undefined;

    const negocio = {
      '@type': ['LocalBusiness', 'GeneralContractor'],
      ...(base && { '@id': abs('/#negocio'), url: abs('/'), image: abs('/og-image.jpg') }),
      name: INFO_EMPRESA.nombreCompleto,
      alternateName: INFO_EMPRESA.nombre,
      description: descripcion,
      telephone: telefono,
      ...(INFO_EMPRESA.email && { email: INFO_EMPRESA.email }),
      ...(direccion && { address: direccion }),
      ...(zonas && { areaServed: zonas.map((n) => ({ '@type': 'AdministrativeArea', name: n })) }),
      contactPoint: [
        { '@type': 'ContactPoint', telephone: telefono, contactType: 'customer service', availableLanguage: 'es' },
      ],
      knowsAbout: SERVICIOS.map((s) => s.titulo),
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Servicios',
        itemListElement: SERVICIOS.map((s) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: s.titulo, description: s.descripcion },
        })),
      },
    };
    const web = base && {
      '@type': 'WebSite',
      '@id': abs('/#web'),
      url: abs('/'),
      name: INFO_EMPRESA.nombre,
      inLanguage: 'es-ES',
      publisher: { '@id': abs('/#negocio') },
    };
    const grafo = web ? { '@context': 'https://schema.org', '@graph': [negocio, web] } : { '@context': 'https://schema.org', ...negocio };
    // `<` escapado por si algún texto lo contuviera dentro de un <script>
    return JSON.stringify(grafo, null, 2).replaceAll('<', '\\u003c');
  }

  function cabecera(): string {
    const t = escapaHtml(titulo);
    const d = escapaHtml(descripcion);
    const img = abs('/og-image.jpg');
    return [
      `<title>${t}</title>`,
      `<meta name="description" content="${d}" />`,
      `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />`,
      si(verificacion, `<meta name="google-site-verification" content="${escapaHtml(verificacion)}" />`),
      si(base, `<link rel="canonical" href="${abs('/')}" />`),
      si(base, `<link rel="alternate" hreflang="es-ES" href="${abs('/')}" />`),
      '',
      `<meta property="og:type" content="website" />`,
      `<meta property="og:site_name" content="${escapaHtml(INFO_EMPRESA.nombre)}" />`,
      `<meta property="og:locale" content="es_ES" />`,
      `<meta property="og:title" content="${t}" />`,
      `<meta property="og:description" content="${d}" />`,
      si(base, `<meta property="og:url" content="${abs('/')}" />`),
      `<meta property="og:image" content="${img}" />`,
      `<meta property="og:image:type" content="image/jpeg" />`,
      `<meta property="og:image:width" content="1200" />`,
      `<meta property="og:image:height" content="630" />`,
      `<meta property="og:image:alt" content="${escapaHtml(alt)}" />`,
      '',
      `<meta name="twitter:card" content="summary_large_image" />`,
      `<meta name="twitter:title" content="${t}" />`,
      `<meta name="twitter:description" content="${d}" />`,
      `<meta name="twitter:image" content="${img}" />`,
      `<meta name="twitter:image:alt" content="${escapaHtml(alt)}" />`,
      '',
      `<script type="application/ld+json">\n${jsonLd()}\n</script>`,
    ]
      .filter((l): l is string => l !== null)
      .join('\n    ');
  }

  /** Resumen en Markdown (llmstxt.org) para asistentes de IA, con los mismos datos acreditados. */
  function llmsTxt(): string {
    const lineas = [
      `# ${INFO_EMPRESA.nombreCompleto}`,
      '',
      `> ${descripcion} ${INFO_EMPRESA.lema}`,
      '',
      '## Servicios',
      ...SERVICIOS.map((s) => `- ${s.titulo}: ${s.descripcion}`),
      '',
      '## Contacto',
      `- Teléfono: ${INFO_EMPRESA.telefono} (${telefono})`,
      `- WhatsApp: https://wa.me/${INFO_EMPRESA.whatsapp}`,
      ...(INFO_EMPRESA.email ? [`- Correo: ${INFO_EMPRESA.email}`] : []),
      ...(zona ? [`- Zona: ${zona}`] : []),
      ...(base ? ['', '## Web', `- [Inicio](${abs('/')}): presentación, servicios y formulario de presupuesto`] : []),
      '',
    ];
    return lineas.join('\n');
  }

  return {
    name: 'fs-seo',
    configResolved(config) {
      const env = loadEnv(config.mode, config.envDir || config.root, 'VITE_');
      const bruta = (env.VITE_SITE_URL ?? '').trim();
      // Solo se acepta http(s); se quita la barra final para componer rutas.
      base = /^https?:\/\//i.test(bruta) ? bruta.replace(/\/+$/, '') : '';
      verificacion = (env.VITE_GOOGLE_SITE_VERIFICATION ?? '').trim();
      outDir = resolve(config.root, config.build.outDir);
      esSsr = !!config.build.ssr;
    },
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => html.replace('<!--SEO_TAGS-->', cabecera()),
    },
    // llms.txt siempre; con dominio, además, sitemap de una sola URL y línea Sitemap
    // en robots.txt. Corre tras copiar public/, por lo que no lo pisa.
    async writeBundle(options) {
      if (esSsr) return;
      const dir = options.dir ? resolve(options.dir) : outDir;
      await writeFile(resolve(dir, 'llms.txt'), llmsTxt());
      if (!base) return;
      const hoy = new Date().toISOString().slice(0, 10);
      await writeFile(
        resolve(dir, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${base}/</loc><lastmod>${hoy}</lastmod><changefreq>monthly</changefreq><priority>1.0</priority></url>\n</urlset>\n`,
      );
      const robots = resolve(dir, 'robots.txt');
      const actual = await readFile(robots, 'utf8').catch(() => 'User-agent: *\nAllow: /\n');
      await writeFile(robots, `${actual.trimEnd()}\n\nSitemap: ${base}/sitemap.xml\n`);
    },
  };
}

/** Precarga de fuentes críticas (segundo plugin para poder usar order: 'post' con el bundle). */
function precargaFuentes(): Plugin {
  const criticas = [
    /barlow-condensed-latin-900-normal.*\.woff2$/,
    /barlow-condensed-latin-700-normal.*\.woff2$/,
    /inter-latin-wght-normal.*\.woff2$/,
  ];
  return {
    name: 'fs-precarga-fuentes',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx): HtmlTagDescriptor[] {
        if (!ctx.bundle) return [];
        const ficheros = Object.keys(ctx.bundle);
        const tags: HtmlTagDescriptor[] = [];
        for (const patron of criticas) {
          const nombre = ficheros.find((f) => patron.test(f));
          if (nombre) {
            tags.push({
              tag: 'link',
              attrs: { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: '', href: `/${nombre}` },
              injectTo: 'head',
            });
          }
        }
        return tags;
      },
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), seoDelSitio(), precargaFuentes()],
  build: {
    target: 'es2022',
  },
});
