// ── Cifras y credenciales de la empresa ──────────────────────
// SOLO datos confirmados por el titular. Mientras la lista esté vacía, la
// sección «04 Empresa» no muestra ningún bloque de cifras.
//
// Ejemplos del formato (NO usar estos valores, son solo ilustrativos):
//   { valor: '0000', etiqueta: 'Qué mide esta cifra' }
// No añadir años de experiencia, nº de proyectos, certificaciones ni
// garantías hasta que el titular los confirme y pueda acreditarlos.

export interface Credencial {
  /** Cifra o dato destacado, tal cual se mostrará. */
  valor: string;
  /** Qué significa el valor (texto corto). */
  etiqueta: string;
}

export const CREDENCIALES: Credencial[] = [];
