// ── Proceso de trabajo (sección 05) ──────────────────────────
// Solo se afirma lo que ya recoge el proyecto original: escuchar el proyecto
// (por WhatsApp o por teléfono), valorarlo con presupuesto sin compromiso,
// planificar y preparar el terreno.
// Sin plazos, garantías ni compromisos que no estén acreditados.

export interface PasoProceso {
  titulo: string;
  descripcion: string;
}

export const PASOS_PROCESO: PasoProceso[] = [
  {
    titulo: 'Cuéntanos tu proyecto',
    descripcion: 'Escríbenos por WhatsApp o llámanos y explícanos qué necesitas.',
  },
  {
    titulo: 'Valoramos el trabajo',
    descripcion:
      'Revisamos el tipo de trabajo, la ubicación y la descripción, y te preparamos un presupuesto sin compromiso.',
  },
  {
    titulo: 'Planificamos la ejecución',
    descripcion: 'Elegimos la solución y la maquinaria adecuadas para tu terreno.',
  },
  {
    titulo: 'Preparamos el terreno',
    descripcion: 'Ejecutamos el trabajo y dejamos el terreno listo para el siguiente paso.',
  },
];

export interface DatoPresupuesto {
  titulo: string;
  detalle: string;
  /** Si el dato no es imprescindible, cómo se indica (p. ej. «Si lo conoces»). */
  condicion?: string;
}

/** Información que ayuda a preparar un presupuesto. */
export const DATOS_PRESUPUESTO: DatoPresupuesto[] = [
  { titulo: 'Tipo de trabajo', detalle: 'Qué necesitas hacer: excavación, demolición, limpieza, cimentación…' },
  { titulo: 'Ubicación aproximada', detalle: 'Dónde se encuentra el terreno.' },
  { titulo: 'Descripción del trabajo', detalle: 'Qué hay que hacer y sus dimensiones aproximadas.' },
  { titulo: 'Tipo de terreno', detalle: 'Tierra, roca, vegetación u otros.', condicion: 'Si lo conoces' },
  { titulo: 'Plazos orientativos', detalle: 'Cuándo te gustaría empezar o terminar.', condicion: 'Si los hay' },
];
