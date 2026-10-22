import { Fragment, useCallback, useEffect, useId, useRef, useState } from 'react';
import type { MouseEvent, PointerEvent, ReactNode, SyntheticEvent } from 'react';
import { INFO_EMPRESA } from '../data/empresa';
import { DOCUMENTOS_LEGALES, esClaveLegal } from '../data/legal';
import type { BloqueLegal, ClaveLegal } from '../data/legal';
import { prefersReducedMotion } from '../lib/motion';
import { lockScroll } from '../lib/scrollLock';
import './LegalDialog.css';

// Debe coincidir con la duración de salida de LegalDialog.css (--dur-fast = 180 ms).
const MS_SALIDA = 190;

// ── Texto con marcas: {{dato}}, [texto](url) y **negrita** ─────────
const PATRON = /(\*\*.+?\*\*|\{\{\w+\}\}|\[[^\]]+\]\([^)\s]+\))/g;

/** Valor de un dato de INFO_EMPRESA; undefined si el titular no lo ha facilitado (entonces no se muestra). */
function valorDato(clave: string): string | undefined {
  const valores: Record<string, string | undefined> = {
    // Sin titular legal facilitado, figura el nombre comercial de la empresa
    titularLegal: INFO_EMPRESA.titularLegal ?? INFO_EMPRESA.nombreCompleto,
    cif: INFO_EMPRESA.cif,
    // El domicilio solo existe si se facilita la dirección (la localidad de trabajo no es un domicilio)
    direccion: INFO_EMPRESA.direccion
      ? `${INFO_EMPRESA.direccion}, ${[INFO_EMPRESA.codigoPostal, INFO_EMPRESA.localidad].filter(Boolean).join(' ')}${INFO_EMPRESA.provincia ? ` (${INFO_EMPRESA.provincia})` : ''}`
      : undefined,
    email: INFO_EMPRESA.email,
    telefono: INFO_EMPRESA.telefono,
    nombreCompleto: INFO_EMPRESA.nombreCompleto,
  };
  return valores[clave];
}

/** Dato de INFO_EMPRESA dentro de un texto; no pinta nada si no existe (nunca se inventa). */
function Dato({ clave }: { clave: string }) {
  const valor = valorDato(clave);
  if (!valor) return null;
  if (clave === 'email') return <a href={`mailto:${valor}`}>{valor}</a>;
  if (clave === 'telefono') return <a href={INFO_EMPRESA.telefonoHref}>{valor}</a>;
  return <>{valor}</>;
}

function Enlace({ texto, url }: { texto: string; url: string }) {
  if (!/^https?:\/\//.test(url)) return <a href={url}>{texto}</a>;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      {texto}
      <span className="sr-only"> (se abre en una pestaña nueva)</span>
    </a>
  );
}

function Inline({ texto }: { texto: string }): ReactNode {
  return texto.split(PATRON).map((parte, i) => {
    if (parte.startsWith('{{')) return <Dato key={i} clave={parte.slice(2, -2)} />;
    if (parte.startsWith('**')) return <strong key={i}><Inline texto={parte.slice(2, -2)} /></strong>;
    const enlace = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(parte);
    if (enlace) return <Enlace key={i} texto={enlace[1]} url={enlace[2]} />;
    return <Fragment key={i}>{parte}</Fragment>;
  });
}

function Bloque({ bloque }: { bloque: BloqueLegal }) {
  switch (bloque.tipo) {
    case 'p':
      return <p><Inline texto={bloque.texto} /></p>;
    case 'ul':
      return (
        <ul className="legal-list">
          {bloque.items.map((item) => (
            <li key={item}><Inline texto={item} /></li>
          ))}
        </ul>
      );
    case 'datos': {
      // Solo se muestran las filas cuyo dato existe
      const filas = bloque.filas.filter((f) => {
        const clave = /^\{\{(\w+)\}\}$/.exec(f.valor)?.[1];
        return !clave || Boolean(valorDato(clave));
      });
      if (filas.length === 0) return null;
      return (
        <dl className="legal-datos">
          {filas.map((f) => (
            <div key={f.etiqueta}>
              <dt>{f.etiqueta}</dt>
              <dd><Inline texto={f.valor} /></dd>
            </div>
          ))}
        </dl>
      );
    }
  }
}

function claveDesdeHash(): ClaveLegal | null {
  const h = window.location.hash.slice(1);
  return esClaveLegal(h) ? h : null;
}

export default function LegalDialog() {
  const [clave, setClave] = useState<ClaveLegal | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const disparadorRef = useRef<HTMLElement | null>(null);
  const temporizadorRef = useRef<number | null>(null);
  const pulsoEnFondoRef = useRef(false);
  const cierrePropioRef = useRef(false);
  const tituloId = useId();

  const cancelarSalida = useCallback(() => {
    if (temporizadorRef.current !== null) {
      window.clearTimeout(temporizadorRef.current);
      temporizadorRef.current = null;
    }
    dialogRef.current?.removeAttribute('data-cerrando');
  }, []);

  // Cierra con una salida breve. Por defecto limpia el hash sin recargar ni mover el scroll.
  const cerrar = useCallback((limpiarHash = true) => {
    const d = dialogRef.current;
    if (!d || !d.open || temporizadorRef.current !== null) return;

    if (limpiarHash && claveDesdeHash()) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    const terminar = () => {
      temporizadorRef.current = null;
      d.removeAttribute('data-cerrando');
      cierrePropioRef.current = true;
      d.close();
      setClave(null);
    };
    if (prefersReducedMotion()) {
      terminar();
      return;
    }
    d.setAttribute('data-cerrando', '');
    temporizadorRef.current = window.setTimeout(terminar, MS_SALIDA);
  }, []);

  // Estado inicial + cambios de hash (enlaces del pie, del formulario, botón Atrás).
  useEffect(() => {
    const sincronizar = () => {
      const nueva = claveDesdeHash();
      if (nueva) {
        cancelarSalida();
        if (!dialogRef.current?.open) {
          const activo = document.activeElement;
          disparadorRef.current =
            activo instanceof HTMLElement && activo !== document.body ? activo : null;
        }
        setClave(nueva);
      } else if (dialogRef.current?.open) {
        cerrar(false);
      }
    };
    sincronizar();
    window.addEventListener('hashchange', sincronizar);
    return () => {
      window.removeEventListener('hashchange', sincronizar);
      if (temporizadorRef.current !== null) window.clearTimeout(temporizadorRef.current);
    };
  }, [cancelarSalida, cerrar]);

  // Abre el <dialog> modal (foco atrapado y resto de la página inerte) y bloquea el scroll.
  const abierto = clave !== null;
  useEffect(() => {
    if (!abierto) return;
    const d = dialogRef.current;
    if (!d) return;
    if (!d.open) {
      d.showModal();
      // Por defecto Chrome enfoca el panel con scroll; es mejor empezar en «Cerrar»
      // (anuncia el título del diálogo y las flechas siguen desplazando el texto).
      d.querySelector<HTMLElement>('.legal-close')?.focus({ preventScroll: true });
    }
    return lockScroll();
  }, [abierto]);

  // Al cambiar de documento (p. ej. desde un enlace interno) vuelve al principio.
  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0 });
  }, [clave]);

  // El foco regresa al elemento que abrió el diálogo.
  const alCerrar = (e: SyntheticEvent<HTMLDialogElement>) => {
    e.currentTarget.removeAttribute('data-cerrando');
    const disparador = disparadorRef.current;
    disparadorRef.current = null;
    if (disparador?.isConnected) disparador.focus({ preventScroll: true });
    if (cierrePropioRef.current) {
      cierrePropioRef.current = false;
      return;
    }
    // Cierre ajeno a nuestro flujo: sincroniza hash y estado.
    if (claveDesdeHash()) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    setClave(null);
  };

  // Clic en el fondo: solo si el pulso empezó y terminó fuera del panel (no al arrastrar una selección).
  const alPulsar = (e: PointerEvent<HTMLDialogElement>) => {
    pulsoEnFondoRef.current = e.target === e.currentTarget;
  };
  const alHacerClic = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget && pulsoEnFondoRef.current) cerrar();
    pulsoEnFondoRef.current = false;
  };

  const doc = clave ? DOCUMENTOS_LEGALES[clave] : null;

  return (
    <dialog
      ref={dialogRef}
      className="legal-dialog"
      aria-labelledby={tituloId}
      onCancel={(e) => { e.preventDefault(); cerrar(); }}
      onClose={alCerrar}
      onPointerDown={alPulsar}
      onClick={alHacerClic}
    >
      {doc && (
        <div className="legal-frame tech-frame">
          <div ref={panelRef} className="legal-panel">
            <header className="legal-head">
              <div className="legal-head-text">
                <p className="eyebrow">
                  <span className="eyebrow-num">§</span>
                  <span className="eyebrow-line" aria-hidden="true" />
                  Información legal
                </p>
                <h2 id={tituloId} className="legal-title">{doc.titulo}</h2>
              </div>
              <button type="button" className="legal-close" onClick={() => cerrar()}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="square" aria-hidden="true" focusable="false">
                  <path d="M5 5l14 14M19 5L5 19" />
                </svg>
                Cerrar
              </button>
            </header>

            <div className="legal-body">
              <p className="legal-lead">{doc.resumen}</p>
              {doc.secciones.map((s) => (
                <section key={s.titulo} className="legal-section">
                  <h3 className="legal-h3">{s.titulo}</h3>
                  {s.bloques.map((b, i) => (
                    <Bloque key={i} bloque={b} />
                  ))}
                </section>
              ))}
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
