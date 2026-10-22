// ── Datos de servicios de Fran Sánchez Excavaciones ─────────
// Lista de tipos de trabajo acreditada por el titular (solo estos seis: no añadir otros sin su confirmación). Las descripciones
// definen el servicio de forma neutra: no prometen plazos, garantías,
// certificaciones, gestión de residuos ni medios concretos. Antes de
// ampliar un texto, confirmar el dato con el titular.

export interface ImagenServicio {
  src: string;
  alt: string;
}

export interface Servicio {
  id: string;
  /** Título tal cual se muestra y se envía al formulario (evento fs:servicio). */
  titulo: string;
  /** Definición breve y neutra del trabajo. */
  descripcion: string;
  /**
   * Fotografía real del trabajo. Opcional: mientras no exista, la tarjeta
   * usa solo el pictograma técnico. No añadir imágenes de stock.
   */
  imagen?: ImagenServicio;
}

export const SERVICIOS: Servicio[] = [
  {
    id: 'excavaciones-cimentacion',
    titulo: 'Excavaciones para cimentación',
    descripcion: 'Apertura de zanjas y pozos donde se asienta la cimentación de una edificación.',
  },
  {
    id: 'excavaciones-piscinas',
    titulo: 'Excavaciones para piscinas',
    descripcion: 'Excavación del hueco donde se construye el vaso de una piscina.',
  },
  {
    id: 'demolicion',
    titulo: 'Demolición',
    descripcion: 'Derribo de muros, construcciones y estructuras.',
  },
  {
    id: 'limpieza-escombros',
    titulo: 'Limpieza de escombros',
    descripcion: 'Retirada y carga de los escombros acumulados en una obra, un solar o una parcela.',
  },
  {
    id: 'limpieza-solares',
    titulo: 'Limpieza de solares',
    descripcion: 'Despeje de un solar o parcela: retirada de restos, vegetación y obstáculos.',
  },
  {
    id: 'limpieza-tierras',
    titulo: 'Limpieza de tierras',
    descripcion: 'Retirada de las tierras sobrantes de una excavación o acumuladas en un terreno.',
  },
];

// Los datos de la empresa viven en ./empresa.ts (se re-exportan por compatibilidad).
export { INFO_EMPRESA } from './empresa.ts';
