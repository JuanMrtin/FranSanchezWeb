// ── Validación y mensaje del formulario de contacto ─────────────
// Funciones puras (sin React) para poder probarlas y reutilizarlas.
// El formulario no tiene servidor: valida en el navegador y compone el
// texto que se abre en WhatsApp. Mensajes en español llano: dicen qué
// falta y cómo arreglarlo.

export type NombreCampo = 'nombre' | 'servicio' | 'localidad' | 'telefono' | 'descripcion';
export type ValoresSolicitud = Record<NombreCampo, string>;
export type ErroresSolicitud = Partial<Record<NombreCampo, string>>;

/** Orden visual de los campos: el foco va al primero con error. */
export const ORDEN_CAMPOS: readonly NombreCampo[] = ['nombre', 'servicio', 'localidad', 'telefono', 'descripcion'];

/** Nombre corto de cada campo, para el resumen que leen los lectores de pantalla. */
export const NOMBRE_CAMPO: Record<NombreCampo, string> = {
  nombre: 'Nombre',
  servicio: 'Tipo de trabajo',
  localidad: 'Ubicación',
  telefono: 'Teléfono',
  descripcion: 'Descripción',
};

/** Límites de longitud: el enlace de WhatsApp (wa.me) lleva todo el texto en la URL. */
export const LIMITES = { nombre: 60, localidad: 80, telefono: 20, descripcion: 600 } as const;
export const MIN_DESCRIPCION = 10;
/** Tope de la URL ya codificada; con caracteres especiales (ñ, acentos) el texto crece. */
export const MAX_ENLACE = 3000;

// ── Teléfono ───────────────────────────────────────────────────
/** Teléfono español: 9 cifras que empiezan por 6, 7, 8 o 9, con prefijo opcional. */
export function normalizarTelefono(valor: string): string | null {
  const limpio = valor.replace(/[\s.\-()]/g, '');
  const m = /^(?:\+34|0034|34)?([6-9]\d{8})$/.exec(limpio);
  return m ? `+34${m[1]}` : null;
}

/** Formato legible para mostrar: +34 681 654 845. */
export function formatearTelefono(e164: string): string {
  const m = /^\+34(\d{3})(\d{3})(\d{3})$/.exec(e164);
  return m ? `+34 ${m[1]} ${m[2]} ${m[3]}` : e164;
}

/** El teléfono es opcional: vacío es válido; si se escribe, tiene que ser un número español. */
export function validarTelefonoOpcional(valor: string): string | undefined {
  const v = valor.trim();
  if (!v) return undefined;
  if (/[^\d\s.()+-]/.test(v)) {
    return 'El teléfono solo puede llevar cifras y espacios, y el prefijo +34 si quieres. Por ejemplo: 612 345 678.';
  }
  return normalizarTelefono(v)
    ? undefined
    : 'El teléfono debe tener 9 cifras y empezar por 6, 7, 8 o 9 (con o sin +34). Por ejemplo: 612 345 678.';
}

// ── Validación por campo ───────────────────────────────────────
export function validarCampo(campo: NombreCampo, v: ValoresSolicitud): string | undefined {
  switch (campo) {
    case 'nombre':
      return v.nombre.trim().length < 2 ? 'Escribe tu nombre para saber quién nos escribe.' : undefined;
    case 'servicio':
      return v.servicio ? undefined : 'Elige el tipo de trabajo. Si no lo tienes claro, selecciona «Otro / no estoy seguro».';
    case 'localidad':
      return v.localidad.trim().length < 2 ? 'Indica la localidad o la zona donde está el trabajo.' : undefined;
    case 'telefono':
      return validarTelefonoOpcional(v.telefono);
    case 'descripcion': {
      const largo = v.descripcion.trim().length;
      if (largo === 0) return 'Describe brevemente lo que necesitas.';
      if (largo < MIN_DESCRIPCION) return `Añade algo más de detalle (al menos ${MIN_DESCRIPCION} caracteres) para poder valorar el trabajo.`;
      if (v.descripcion.length > LIMITES.descripcion) return `La descripción es demasiado larga: el máximo son ${LIMITES.descripcion} caracteres.`;
      return undefined;
    }
  }
}

export function validarTodo(v: ValoresSolicitud): ErroresSolicitud {
  const errores: ErroresSolicitud = {};
  for (const campo of ORDEN_CAMPOS) {
    const msg = validarCampo(campo, v);
    if (msg) errores[campo] = msg;
  }
  return errores;
}

// ── Mensaje de WhatsApp ────────────────────────────────────────
const unaLinea = (s: string) => s.replace(/\s+/g, ' ').trim();

/** Conserva los saltos de línea que escribió la persona, sin espacios sobrantes ni más de una línea en blanco. */
const variasLineas = (s: string) =>
  s.replace(/\r\n?/g, '\n').replace(/[ \t]+/g, ' ').replace(/ ?\n ?/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

/** Texto legible y multilínea que se abre en WhatsApp. Se llama solo con datos ya validados. */
export function construirMensajeWhatsApp(v: ValoresSolicitud): string {
  const lineas = [
    `Hola, soy ${unaLinea(v.nombre)}. Quiero solicitar un presupuesto.`,
    '',
    `Trabajo: ${v.servicio}`,
    `Ubicación: ${unaLinea(v.localidad)}`,
    `Descripción: ${variasLineas(v.descripcion)}`,
  ];
  const telefono = normalizarTelefono(v.telefono);
  if (telefono) lineas.push(`Teléfono de contacto: ${formatearTelefono(telefono)}`);
  return lineas.join('\n');
}
