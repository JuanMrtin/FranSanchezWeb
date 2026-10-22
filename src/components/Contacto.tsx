import {
  useEffect, useId, useRef, useState,
  type ChangeEvent, type FormEvent, type ReactNode,
} from 'react';
import { SERVICIOS } from '../data/servicios';
import { INFO_EMPRESA, ZONA, whatsappHref } from '../data/empresa';
import { useReveal } from '../hooks/useReveal';
import {
  LIMITES, MAX_ENLACE, NOMBRE_CAMPO, ORDEN_CAMPOS,
  construirMensajeWhatsApp, validarCampo, validarTodo,
  type ErroresSolicitud, type NombreCampo, type ValoresSolicitud,
} from '../lib/validacionContacto';
import './Contacto.css';

// ── Constantes ─────────────────────────────────────────────────
const OPCION_OTRO = 'Otro / no estoy seguro';
const VACIO: ValoresSolicitud = { nombre: '', servicio: '', localidad: '', telefono: '', descripcion: '' };

const AYUDA_DATOS = [
  { titulo: 'Tipo de trabajo', texto: 'Qué necesitas hacer: excavar, demoler, limpiar, retirar…' },
  { titulo: 'Ubicación', texto: 'Localidad o zona, y cómo es el acceso hasta el terreno.' },
  { titulo: 'Dimensiones', texto: 'Superficie o profundidad aproximadas, aunque sean estimadas.' },
  { titulo: 'Terreno y plazos', texto: 'Tipo de terreno y la fecha en que lo necesitas, si la hay.' },
] as const;

/** Qué se le ha enseñado a la persona tras pulsar «Enviar por WhatsApp». */
interface Aviso {
  href: string;
  mensaje: string;
  /** true si el navegador no ha permitido abrir la pestaña nueva. */
  bloqueado: boolean;
}

// ── Iconos (SVG propios, decorativos) ──────────────────────────
const ICONO_TELEFONO =
  'M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z';

function IconoTelefono({ tam = 18 }: { tam?: number }) {
  return (
    <svg width={tam} height={tam} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={ICONO_TELEFONO} />
    </svg>
  );
}

/** Globo de conversación con la cola abajo a la izquierda y un auricular dentro. */
function IconoWhatsApp({ tam = 20 }: { tam?: number }) {
  return (
    <svg width={tam} height={tam} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2.6a9.4 9.4 0 0 0-8.1 14.2L2.6 21.4l4.7-1.2A9.4 9.4 0 1 0 12 2.6z"
        stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round"
      />
      <path d={ICONO_TELEFONO} fill="currentColor" transform="translate(6.1 6.1) scale(0.5)" />
    </svg>
  );
}

function IconoFlecha({ tam = 22 }: { tam?: number }) {
  return (
    <svg width={tam} height={tam} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

// ── Campo con etiqueta, ayuda y error ──────────────────────────
interface CampoProps {
  id: string;
  label: string;
  obligatorio?: boolean;
  opcional?: boolean;
  ayuda?: string;
  /** Texto corto a la derecha de la ayuda (contador de caracteres). */
  contador?: string;
  contadorLleno?: boolean;
  error?: string;
  ancho?: boolean;
  flash?: boolean;
  onFlashEnd?: () => void;
  children: ReactNode;
}

function Campo({
  id, label, obligatorio, opcional, ayuda, contador, contadorLleno, error, ancho, flash, onFlashEnd, children,
}: CampoProps) {
  return (
    <div
      className={`campo${error ? ' campo--error' : ''}${ancho ? ' campo--ancho' : ''}${flash ? ' campo--flash' : ''}`}
      onAnimationEnd={onFlashEnd}
    >
      <label htmlFor={id} className="campo-label">
        {label}
        {obligatorio && <span className="campo-obligatorio" aria-hidden="true"> *</span>}
        {opcional && <span className="campo-opcional"> (opcional)</span>}
      </label>
      {children}
      {(ayuda || contador) && (
        <div className="campo-pie">
          {ayuda && <p className="campo-ayuda" id={`${id}-ayuda`}>{ayuda}</p>}
          {contador && (
            <p className={`campo-contador${contadorLleno ? ' campo-contador--lleno' : ''}`} aria-hidden="true">{contador}</p>
          )}
        </div>
      )}
      {error && (
        <p className="campo-error" id={`${id}-error`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

/** aria-describedby: ayuda y error, solo los que existen. */
function describedBy(id: string, ayuda: boolean, error?: string) {
  const ids = [ayuda ? `${id}-ayuda` : '', error ? `${id}-error` : ''].filter(Boolean);
  return ids.length ? ids.join(' ') : undefined;
}

// ── Sección ────────────────────────────────────────────────────
export default function Contacto() {
  const uid = useId();
  const seccionRef = useReveal();

  const [form, setForm] = useState<ValoresSolicitud>(VACIO);
  const [errores, setErrores] = useState<ErroresSolicitud>({});
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [anuncio, setAnuncio] = useState('');
  const [servicioDestacado, setServicioDestacado] = useState(false);
  /** Sube cada vez que una tarjeta elige servicio: dispara el traslado del foco al desplegable. */
  const [servicioElegido, setServicioElegido] = useState(0);

  const refs = useRef<Partial<Record<NombreCampo, HTMLElement | null>>>({});
  const tocados = useRef<Set<NombreCampo>>(new Set());
  const avisoRef = useRef<HTMLDivElement>(null);

  const idDe = (campo: NombreCampo) => `${uid}-${campo}`;
  const registrar = (campo: NombreCampo) => (el: HTMLElement | null) => { refs.current[campo] = el; };

  // Servicios → Contacto: preselecciona el servicio elegido en una tarjeta
  useEffect(() => {
    const alElegirServicio = (e: Event) => {
      const detalle = (e as CustomEvent<{ servicio?: unknown }>).detail;
      const servicio = typeof detalle?.servicio === 'string' ? detalle.servicio : '';
      if (!servicio) return;
      const existe = servicio === OPCION_OTRO || SERVICIOS.some((s) => s.titulo === servicio);
      if (!existe) return;
      setForm((prev) => ({ ...prev, servicio }));
      setErrores((prev) => ({ ...prev, servicio: undefined }));
      setAviso(null); // el mensaje anterior ya no corresponde a lo que hay en el formulario
      setServicioDestacado(true);
      setServicioElegido((n) => n + 1);
    };
    window.addEventListener('fs:servicio', alElegirServicio);
    return () => window.removeEventListener('fs:servicio', alElegirServicio);
  }, []);

  // Tras elegir un servicio desde una tarjeta el foco pasa al desplegable (sin mover el scroll),
  // para que el teclado no se quede en la tarjeta de origen
  useEffect(() => {
    if (servicioElegido > 0) refs.current.servicio?.focus({ preventScroll: true });
  }, [servicioElegido]);

  // Si la pestaña de WhatsApp no se ve (móvil, ventana bloqueada), que el aviso al menos quede a la vista
  useEffect(() => {
    if (aviso) avisoRef.current?.scrollIntoView({ block: 'nearest' });
  }, [aviso]);

  const alCambiar = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const campo = e.target.name as NombreCampo;
    const siguiente = { ...form, [campo]: e.target.value };
    setForm(siguiente);
    if (campo === 'servicio') setServicioDestacado(false);
    if (aviso) setAviso(null); // al editar, el mensaje ya abierto deja de coincidir
    // Si ya había error (o es un desplegable, que cambia de golpe) se revalida al instante
    if (errores[campo] || (campo === 'servicio' && tocados.current.has(campo))) {
      setErrores((prev) => ({ ...prev, [campo]: validarCampo(campo, siguiente) }));
    }
    tocados.current.add(campo);
  };

  // Al salir de un campo que se ha tocado se muestra su error, no antes
  const alSalir = (campo: NombreCampo) => () => {
    if (!tocados.current.has(campo)) return;
    setErrores((prev) => ({ ...prev, [campo]: validarCampo(campo, form) }));
  };

  const marcarErrores = (errs: ErroresSolicitud) => {
    setErrores(errs);
    const invalidos = ORDEN_CAMPOS.filter((c) => errs[c]);
    if (!invalidos.length) return false;
    const nombres = invalidos.map((c) => NOMBRE_CAMPO[c]).join(', ');
    setAnuncio(invalidos.length === 1 ? `Hay 1 campo por revisar: ${nombres}.` : `Hay ${invalidos.length} campos por revisar: ${nombres}.`);
    refs.current[invalidos[0]]?.focus();
    return true;
  };

  const alEnviar = (e: FormEvent) => {
    e.preventDefault();
    ORDEN_CAMPOS.forEach((c) => tocados.current.add(c));
    setAviso(null);
    if (marcarErrores(validarTodo(form))) return;

    const mensaje = construirMensajeWhatsApp(form);
    const href = whatsappHref(mensaje);
    if (href.length > MAX_ENLACE) {
      marcarErrores({ descripcion: 'El mensaje es demasiado largo para WhatsApp. Acorta la descripción.' });
      return;
    }

    // Con la característica «noopener» window.open devuelve siempre null y no se podría saber si
    // el navegador bloqueó la ventana: se abre normal y se corta el vínculo con esta página después.
    const ventana = window.open(href, '_blank');
    if (ventana) {
      try { ventana.opener = null; } catch { /* la ventana ya navega a otro origen */ }
    }
    setAnuncio('');
    setAviso({ href, mensaje, bloqueado: !ventana });
  };

  const limpiar = () => {
    setForm(VACIO);
    setErrores({});
    setAviso(null);
    setServicioDestacado(false);
    tocados.current.clear();
    setAnuncio('Formulario vacío.');
    refs.current.nombre?.focus();
  };

  // Props comunes de cada control
  const propsControl = (campo: NombreCampo, { ayuda = false, obligatorio = true } = {}) => ({
    id: idDe(campo),
    name: campo,
    ref: registrar(campo),
    'aria-required': obligatorio ? (true as const) : undefined,
    'aria-invalid': errores[campo] ? (true as const) : undefined,
    'aria-describedby': describedBy(idDe(campo), ayuda, errores[campo]),
    onBlur: alSalir(campo),
  });

  const restantes = LIMITES.descripcion - form.descripcion.length;

  return (
    <section
      id="contacto"
      className="contacto topo-bg"
      ref={seccionRef}
      aria-labelledby="contacto-titulo"
    >
      <div className="container contacto-grid">

        {/* ── Columna informativa ─────────────────────────────── */}
        <div className="contacto-info reveal-left">
          <p className="eyebrow">
            <span className="eyebrow-num">06</span>
            <span className="eyebrow-line" aria-hidden="true" />
            <span>Contacto</span>
          </p>
          <h2 id="contacto-titulo" className="display-2 contacto-titulo">
            Solicita tu <span className="text-yellow">presupuesto</span>
          </h2>
          <p className="lead contacto-lead">
            Cuéntanos qué necesitas y dónde está el trabajo. Con esos datos preparamos un mensaje de WhatsApp listo para enviar.
            Si lo prefieres, llámanos y lo hablamos.
          </p>

          <a href={INFO_EMPRESA.telefonoHref} className="contacto-tel">
            <span className="contacto-tel-ico" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d={ICONO_TELEFONO} /></svg>
            </span>
            <span className="contacto-tel-texto">
              <span className="label-mono">Llamar ahora</span>
              <span className="contacto-tel-num">{INFO_EMPRESA.telefono}</span>
            </span>
            <span className="contacto-tel-flecha" aria-hidden="true"><IconoFlecha /></span>
          </a>

          <a href={whatsappHref()} className="contacto-wa" target="_blank" rel="noopener noreferrer">
            <span className="contacto-wa-ico" aria-hidden="true"><IconoWhatsApp tam={26} /></span>
            <span className="contacto-wa-texto">
              <span className="label-mono">Escribir por WhatsApp</span>
              <span className="contacto-wa-detalle">Abre el chat sin rellenar el formulario</span>
            </span>
            <span className="contacto-wa-flecha" aria-hidden="true"><IconoFlecha tam={20} /></span>
            <span className="sr-only">(se abre en una pestaña nueva)</span>
          </a>

          {(INFO_EMPRESA.email || ZONA) && (
            <ul className="contacto-datos">
              {INFO_EMPRESA.email && (
                <li><span className="label-mono">Correo</span>
                  <a className="link-yellow" href={`mailto:${INFO_EMPRESA.email}`}>{INFO_EMPRESA.email}</a></li>
              )}
              {ZONA && (
                <li><span className="label-mono">Zona de trabajo</span>
                  <span className="contacto-zona">{ZONA}</span></li>
              )}
            </ul>
          )}

          <div className="contacto-ayuda">
            <h3 className="contacto-ayuda-titulo">Qué datos nos ayudan</h3>
            <ul className="contacto-ayuda-lista">
              {AYUDA_DATOS.map((d, i) => (
                <li key={d.titulo}>
                  <span className="contacto-ayuda-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <span>
                    <strong>{d.titulo}</strong>
                    <span className="contacto-ayuda-texto">{d.texto}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Panel del formulario ────────────────────────────── */}
        <div className="contacto-panel tech-frame reveal-right">
          <header className="contacto-panel-cab">
            <h3 className="contacto-panel-titulo" id={`${uid}-form-titulo`}>Solicitud de presupuesto</h3>
            <p className="contacto-panel-nota">Los campos con <span aria-hidden="true">*</span><span className="sr-only">asterisco</span> son obligatorios</p>
          </header>
          <div className="tech-rule" aria-hidden="true" />

          {/* Resumen de errores para lectores de pantalla (no usa role=alert) */}
          <p className="sr-only" role="status" aria-live="polite">{anuncio}</p>

          <form className="contacto-form" onSubmit={alEnviar} noValidate aria-labelledby={`${uid}-form-titulo`}>
            <div className="contacto-campos">
              <Campo id={idDe('nombre')} label="Nombre" obligatorio error={errores.nombre}>
                <input
                  {...propsControl('nombre')}
                  type="text"
                  className="campo-control"
                  value={form.nombre}
                  onChange={alCambiar}
                  autoComplete="name"
                  autoCapitalize="words"
                  maxLength={LIMITES.nombre}
                />
              </Campo>

              <Campo
                id={idDe('servicio')}
                label="Tipo de trabajo"
                obligatorio
                error={errores.servicio}
                flash={servicioDestacado}
                onFlashEnd={() => setServicioDestacado(false)}
              >
                <div className="campo-caja">
                  <select
                    {...propsControl('servicio')}
                    className="campo-control campo-select"
                    value={form.servicio}
                    onChange={alCambiar}
                    autoComplete="off"
                  >
                    <option value="">Selecciona una opción</option>
                    {SERVICIOS.map((s) => (
                      <option key={s.id} value={s.titulo}>{s.titulo}</option>
                    ))}
                    <option value={OPCION_OTRO}>{OPCION_OTRO}</option>
                  </select>
                </div>
              </Campo>

              <Campo id={idDe('localidad')} label="Ubicación aproximada" obligatorio ayuda="Localidad o zona del proyecto." error={errores.localidad}>
                <input
                  {...propsControl('localidad', { ayuda: true })}
                  type="text"
                  className="campo-control"
                  value={form.localidad}
                  onChange={alCambiar}
                  autoComplete="address-level2"
                  maxLength={LIMITES.localidad}
                />
              </Campo>

              <Campo
                id={idDe('telefono')}
                label="Otro teléfono"
                opcional
                ayuda="Solo si prefieres que te llamen a un número distinto al de tu WhatsApp."
                error={errores.telefono}
              >
                <input
                  {...propsControl('telefono', { ayuda: true, obligatorio: false })}
                  type="tel"
                  inputMode="tel"
                  className="campo-control"
                  value={form.telefono}
                  onChange={alCambiar}
                  placeholder="612 345 678"
                  autoComplete="tel"
                  maxLength={LIMITES.telefono}
                />
              </Campo>

              <Campo
                id={idDe('descripcion')}
                label="Descripción de las necesidades"
                obligatorio
                ancho
                ayuda={`Indica dimensiones aproximadas, tipo de terreno y plazos si los hay. Máximo ${LIMITES.descripcion} caracteres.`}
                contador={`${form.descripcion.length}/${LIMITES.descripcion}`}
                contadorLleno={restantes <= 60}
                error={errores.descripcion}
              >
                <textarea
                  {...propsControl('descripcion', { ayuda: true })}
                  className="campo-control campo-area"
                  value={form.descripcion}
                  onChange={alCambiar}
                  rows={5}
                  maxLength={LIMITES.descripcion}
                />
              </Campo>
            </div>

            {/* Dos salidas: el formulario por WhatsApp (principal) o llamar sin rellenar nada */}
            <div className="contacto-cta">
              <button type="submit" className="btn btn-primary contacto-enviar">
                <IconoWhatsApp />
                <span>Enviar por WhatsApp</span>
              </button>
              <a className="btn btn-outline contacto-llamar" href={INFO_EMPRESA.telefonoHref}>
                <IconoTelefono />
                <span>Llamar al {INFO_EMPRESA.telefono}</span>
              </a>
            </div>

            {/* Región viva fija: el aviso se inserta dentro y se anuncia sin mover el foco */}
            <div className="contacto-resultado" role="status" aria-live="polite">
              {aviso && (
                <div className="contacto-aviso" ref={avisoRef}>
                  <span className="contacto-aviso-ico" aria-hidden="true"><IconoWhatsApp tam={28} /></span>
                  <div className="contacto-aviso-cuerpo">
                    <h4 className="contacto-aviso-titulo">
                      {aviso.bloqueado ? 'El navegador ha bloqueado la ventana' : 'WhatsApp abierto con tu mensaje listo'}
                    </h4>
                    <p>
                      {aviso.bloqueado
                        ? 'Pulsa «Abrir WhatsApp» para ver tu mensaje ya escrito. '
                        : 'Si no se ha abierto, puedes volver a abrirlo. '}
                      Falta un paso: pulsa enviar en WhatsApp para completar la solicitud. Hasta entonces no hemos recibido nada.
                    </p>
                    <pre className="contacto-mensaje">{aviso.mensaje}</pre>
                    <div className="contacto-aviso-acciones">
                      <a className="btn btn-outline" href={aviso.href} target="_blank" rel="noopener noreferrer">
                        <IconoWhatsApp tam={18} />
                        <span>{aviso.bloqueado ? 'Abrir WhatsApp' : 'Reabrir WhatsApp'}</span>
                        <span className="sr-only">(se abre en una pestaña nueva)</span>
                      </a>
                      <button type="button" className="contacto-volver" onClick={limpiar}>
                        Borrar los datos y empezar de nuevo
                      </button>
                    </div>
                    <p className="contacto-aviso-pista">Para cambiar algo, edita los campos y vuelve a pulsar «Enviar por WhatsApp».</p>
                  </div>
                </div>
              )}
            </div>

            <p className="contacto-nota">
              Se abrirá WhatsApp con tu mensaje ya escrito; solo tienes que pulsar enviar. Esta web no guarda tus datos.{' '}
              Más información en la <a className="link-yellow" href="#privacidad">política de privacidad</a>.
            </p>
          </form>
        </div>

      </div>
    </section>
  );
}
