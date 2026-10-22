// ── Datos reales de la empresa ───────────────────────────────
// ÚNICA fuente de verdad para teléfono, nombre y enlaces de navegación.
// Regla del proyecto: aquí solo hay datos acreditados. No añadir cifras,
// años de experiencia, certificaciones ni garantías sin confirmación del
// titular. Si no existe el dato, el campo se deja sin definir y la web
// no lo muestra.

export interface InfoEmpresa {
  nombre: string;
  nombreCompleto: string;
  lema: string;
  telefono: string;
  telefonoHref: string;
  /** Número de WhatsApp en formato internacional sin + ni espacios (el mismo móvil de contacto). */
  whatsapp: string;
  /** Pendiente de aportar por el titular: la web lo oculta mientras no exista. */
  email?: string;
  direccion?: string;
  localidad?: string;
  /** Código postal del domicilio de la actividad. */
  codigoPostal?: string;
  /** Provincia donde trabaja la empresa (clave para el SEO local). */
  provincia?: string;
  /** Municipios o comarcas donde presta servicio (aparecen en los datos estructurados). */
  zonasActuacion?: string[];
  /** Titular legal y CIF/NIF para aviso legal y política de privacidad. */
  titularLegal?: string;
  cif?: string;
}

// Variables VITE_* (en Node, p. ej. vite.config.ts, no existen y quedan vacías)
const env: Record<string, string | undefined> =
  (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};

export const INFO_EMPRESA: InfoEmpresa = {
  nombre: 'Fran Sánchez Excavaciones',
  nombreCompleto: 'Fran Sánchez Excavaciones y Movimientos de Tierra',
  lema: 'Preparamos el terreno. Construimos el siguiente paso.',
  telefono: '681 654 845',
  telefonoHref: 'tel:+34681654845',
  whatsapp: '34681654845',
  // Datos de identificación del titular (art. 10 LSSI): salen de variables de entorno
  // (ver .env.example) para que no estén en el código del repositorio. Solo se muestran en el
  // aviso legal y la política de privacidad: no se publican en el pie, el contacto ni los
  // datos estructurados. Si no están definidas, simplemente no se muestran.
  titularLegal: env.VITE_TITULAR_NOMBRE,
  cif: env.VITE_TITULAR_NIF,
  direccion: env.VITE_TITULAR_DIRECCION,
  codigoPostal: env.VITE_TITULAR_CP,
  localidad: 'El Saucejo',
  provincia: 'Sevilla',
  // El Saucejo y los municipios de alrededor (la comarca se cita como zona de servicio).
  zonasActuacion: ['El Saucejo', 'Sierra Sur de Sevilla'],
};

/** Zona de trabajo en texto: «El Saucejo y alrededores». */
export const ZONA: string | undefined = INFO_EMPRESA.localidad ? `${INFO_EMPRESA.localidad} y alrededores` : undefined;

/** Enlace de WhatsApp (wa.me). Con mensaje, abre el chat con el texto ya escrito. */
export function whatsappHref(mensaje?: string): string {
  const base = `https://wa.me/${INFO_EMPRESA.whatsapp}`;
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
}

export interface EnlaceNav {
  /** Hash de la sección (también es el id del elemento). */
  href: string;
  label: string;
}

export const NAV_LINKS: EnlaceNav[] = [
  { href: '#inicio',    label: 'Inicio' },
  { href: '#servicios', label: 'Servicios' },
  { href: '#trabajos',  label: 'Trabajos' },
  { href: '#empresa',   label: 'Empresa' },
  { href: '#contacto',  label: 'Contacto' },
];
