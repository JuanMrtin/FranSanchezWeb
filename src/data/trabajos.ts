// ── Galería de trabajos ──────────────────────────────────────
// Esta lista dirige la sección «03 Trabajos». Mientras esté VACÍA la web
// no muestra galería (ni placeholders): enseña el índice de tipos de trabajo.
// En cuanto se añada una foto real, la sección se transforma sola en galería
// con rejilla editorial y vista ampliada. No hay que tocar ningún componente.
//
// CÓMO AÑADIR FOTOS REALES
//  1. Copia la imagen a `public/images/trabajos/` (p. ej. `cimentacion-01.webp`).
//     Formato recomendado: WebP (calidad ~80). Si solo tienes JPG, también vale.
//  2. Tamaño: lado largo de 1600 px para la rejilla. Si quieres una versión más
//     grande para la vista ampliada, súbela aparte (2400 px) y úsala en
//     `srcAmpliada`. Pesos orientativos: < 250 KB la de rejilla, < 600 KB la grande.
//  3. Añade un objeto al array `TRABAJOS` con sus datos reales:
//       {
//         id: 'cimentacion-01',                     // único, sin espacios
//         titulo: 'Excavación para cimentación',    // lo que muestra la foto, sin inventar
//         categoria: 'Cimentación',                 // etiqueta corta
//         src: '/images/trabajos/cimentacion-01.webp',
//         alt: 'Retroexcavadora abriendo la zanja de una cimentación', // describe la imagen
//         ancho: 'wide',                            // 'normal' | 'wide' | 'tall'
//         anchoPx: 1600, altoPx: 900,               // medidas reales del archivo (evita saltos de maquetación)
//         ubicacion: 'Localidad',                   // opcional: solo si es un dato real
//         fecha: '2025',                            // opcional
//       }
//  4. `ancho` decide el hueco en la rejilla: 'normal' (apaisada estándar),
//     'wide' (panorámica, ocupa más ancho) y 'tall' (vertical, ocupa más alto).
//     Alterna formatos para que la composición respire; con 6 u 8 fotos queda mejor.
//  5. El `alt` debe describir lo que se ve, no repetir el título.
//
// Regla del proyecto: solo fotos y datos reales de trabajos de la empresa.

export type AnchoTrabajo = 'normal' | 'wide' | 'tall';

export interface Trabajo {
  /** Identificador único y estable (sin espacios). */
  id: string;
  titulo: string;
  /** Etiqueta corta del tipo de trabajo, p. ej. «Cimentación». */
  categoria: string;
  /** Ruta pública de la imagen de la rejilla, bajo /images/trabajos/. */
  src: string;
  /** Texto alternativo que describe lo que se ve en la foto. */
  alt: string;
  /** Hueco que ocupa en la rejilla editorial. */
  ancho: AnchoTrabajo;
  /** Opcional: versión mayor para la vista ampliada (por defecto, `src`). */
  srcAmpliada?: string;
  /** Opcional: `srcset` de la imagen de la rejilla. */
  srcSet?: string;
  /** Opcional: solo si es un dato real. */
  ubicacion?: string;
  fecha?: string;
  /** Medidas reales del archivo `src`: reservan el hueco y evitan CLS. */
  anchoPx?: number;
  altoPx?: number;
}

const F = '/images/trabajos/';

// Fotos reales facilitadas por el titular (zanjas y retroexcavadora en olivares).
// Orden y formatos pensados para la rejilla: dos verticales y dos apaisadas apiladas.
export const TRABAJOS: Trabajo[] = [
  {
    id: 'zanja-tuberia-ladera',
    titulo: 'Zanja con tubería en ladera',
    categoria: 'Excavación',
    src: `${F}zanja-tuberia-ladera-640.webp`,
    srcSet: `${F}zanja-tuberia-ladera-640.webp 640w, ${F}zanja-tuberia-ladera-938.webp 938w`,
    srcAmpliada: `${F}zanja-tuberia-ladera-938.webp`,
    alt: 'Zanja larga y recta con tuberías negras tendidas, abierta en una ladera de olivos',
    ancho: 'tall',
    anchoPx: 640,
    altoPx: 1143,
  },
  {
    id: 'plantacion-ladera',
    titulo: 'Terreno preparado en ladera',
    categoria: 'Movimiento de tierras',
    src: `${F}plantacion-ladera-640.webp`,
    srcSet: `${F}plantacion-ladera-640.webp 640w, ${F}plantacion-ladera-938.webp 938w`,
    srcAmpliada: `${F}plantacion-ladera-938.webp`,
    alt: 'Ladera de tierra labrada con filas de árboles jóvenes y una zanja a un lado',
    ancho: 'tall',
    anchoPx: 640,
    altoPx: 1032,
  },
  {
    id: 'terreno-movimiento-tierras',
    titulo: 'Terreno removido',
    categoria: 'Movimiento de tierras',
    src: `${F}terreno-movimiento-tierras-640.webp`,
    srcSet: `${F}terreno-movimiento-tierras-640.webp 640w, ${F}terreno-movimiento-tierras-938.webp 938w`,
    srcAmpliada: `${F}terreno-movimiento-tierras-938.webp`,
    alt: 'Terreno de tierra rojiza removida con montones de tierra y una loma al fondo',
    ancho: 'normal',
    anchoPx: 640,
    altoPx: 480,
  },
  {
    id: 'detalle-pala-zanja',
    titulo: 'La pala dentro de la zanja',
    categoria: 'Excavación',
    src: `${F}detalle-pala-560.webp`,
    srcSet: `${F}detalle-pala-560.webp 560w, ${F}detalle-pala-1000.webp 1000w`,
    srcAmpliada: `${F}retroexcavadora-zanja-detalle-1125.webp`,
    alt: 'Pala y cilindros de una retroexcavadora dentro de una zanja recta en un olivar',
    ancho: 'normal',
    anchoPx: 560,
    altoPx: 420,
  },
];
