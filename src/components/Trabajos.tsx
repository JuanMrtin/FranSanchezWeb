import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import { useReveal } from '../hooks/useReveal';
import { conGsap } from '../lib/gsap';
import { scrollToId } from '../lib/motion';
import { INFO_EMPRESA, SERVICIOS } from '../data/servicios';
import { TRABAJOS } from '../data/trabajos';
import type { Trabajo } from '../data/trabajos';
import TrabajosVisor from './TrabajosVisor';
import './Trabajos.css';


const pad = (n: number) => String(n).padStart(2, '0');

// ── Eyebrow numerado (misma gramática que Servicios) ──────────
function Eyebrow() {
  return (
    <p className="eyebrow trabajos-eyebrow reveal">
      <span className="eyebrow-num">03</span>
      <span className="eyebrow-line" aria-hidden="true" />
      Trabajos
    </p>
  );
}

// ── Botones de contacto compartidos por las dos versiones ─────
function Acciones() {
  const ir = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToId('#contacto');
  };
  return (
    <div className="trabajos-acciones">
      <a href="#contacto" className="btn btn-primary" onClick={ir}>
        Pedir presupuesto
      </a>
      <a href={INFO_EMPRESA.telefonoHref} className="btn btn-outline">
        Llamar al {INFO_EMPRESA.telefono}
      </a>
    </div>
  );
}

// ── Sin fotos: índice tipográfico de tipos de trabajo ─────────
// Se deriva de SERVICIOS. No enseña proyectos ni imágenes inventadas.
function IndiceTrabajos() {
  const elegir = (e: MouseEvent<HTMLAnchorElement>, servicio: string) => {
    e.preventDefault();
    // Contrato con Contacto: preselecciona el servicio en el desplegable.
    window.dispatchEvent(new CustomEvent('fs:servicio', { detail: { servicio } }));
    scrollToId('#contacto');
  };

  return (
    <div className="trabajos-indice tech-frame reveal-right">
      <div className="trabajos-indice-cab">
        <h3 className="trabajos-indice-titulo">Tipos de trabajo</h3>
        <span className="trabajos-indice-total" aria-hidden="true">
          {pad(SERVICIOS.length)}
        </span>
      </div>
      <div className="tech-rule" aria-hidden="true" />

      <ol className="trabajos-indice-lista" role="list">
        {SERVICIOS.map((s, i) => (
          <li key={s.id} className="indice-item reveal" style={{ '--delay': `${0.12 + i * 0.05}s` } as CSSProperties}>
            <a href="#contacto" className="indice-fila" onClick={(e) => elegir(e, s.titulo)}>
              <span className="indice-num" aria-hidden="true">
                {pad(i + 1)}
              </span>
              <span className="indice-nombre">
                {s.titulo}
                <span className="sr-only">. Pedir presupuesto de este trabajo</span>
              </span>
              <svg className="indice-flecha" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </li>
        ))}
      </ol>
      <p className="trabajos-indice-nota">Elige un tipo de trabajo para pedir presupuesto.</p>
    </div>
  );
}

// ── Con fotos: rejilla editorial + visor ──────────────────────
// Columnas y filas que ocupa cada formato en la rejilla de escritorio (6 columnas).
const COLUMNAS = 6;
const HUECO: Record<Trabajo['ancho'], [number, number]> = { normal: [2, 2], wide: [4, 2], tall: [2, 4] };

/**
 * Simula la colocación densa de la rejilla y devuelve cuántas columnas libres quedan a la
 * derecha de la última foto. Así la última fila nunca termina con un hueco vacío:
 * esa foto se ensancha lo que haga falta (las verticales no se ensanchan).
 */
function columnasExtraUltima(items: Trabajo[]): number {
  const ocupado = new Set<string>();
  const libre = (r: number, c: number, w: number, h: number) => {
    for (let dr = 0; dr < h; dr++) for (let dc = 0; dc < w; dc++) if (ocupado.has(`${r + dr}:${c + dc}`)) return false;
    return true;
  };
  let ultima = { r: 0, c: 0, w: 0, h: 0 };
  for (const t of items) {
    const [w, h] = HUECO[t.ancho];
    let colocada = false;
    for (let r = 0; !colocada; r++) {
      for (let c = 0; c <= COLUMNAS - w && !colocada; c++) {
        if (!libre(r, c, w, h)) continue;
        for (let dr = 0; dr < h; dr++) for (let dc = 0; dc < w; dc++) ocupado.add(`${r + dr}:${c + dc}`);
        ultima = { r, c, w, h };
        colocada = true;
      }
    }
  }
  if (items[items.length - 1]?.ancho === 'tall') return 0;
  let extra = 0;
  while (ultima.c + ultima.w + extra < COLUMNAS && libre(ultima.r, ultima.c + ultima.w + extra, 1, ultima.h)) extra++;
  return extra;
}

function Galeria({ items }: { items: Trabajo[] }) {
  const rejillaRef = useRef<HTMLDivElement>(null);
  const disparadorRef = useRef<HTMLElement | null>(null);
  const [abierto, setAbierto] = useState<number | null>(null);
  const extraUltima = columnasExtraUltima(items);

  const abrir = (i: number, el: HTMLElement) => {
    disparadorRef.current = el;
    setAbierto(i);
  };
  const cerrar = useCallback(() => {
    setAbierto(null);
    // Devuelve el foco al botón que abrió el visor.
    const el = disparadorRef.current;
    disparadorRef.current = null;
    if (el?.isConnected) requestAnimationFrame(() => el.focus({ preventScroll: true }));
  }, []);

  // Parallax interno sutil: solo con puntero fino y sin «reducir movimiento».
  useEffect(() => {
    const rejilla = rejillaRef.current;
    if (!rejilla) return;
    return conGsap(({ gsap }) => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)', () => {
        rejilla.querySelectorAll<HTMLElement>('.galeria-item').forEach((item) => {
          const medio = item.querySelector<HTMLElement>('.galeria-medio');
          if (!medio) return;
          gsap.fromTo(
            medio,
            { yPercent: -5 },
            {
              yPercent: 5,
              ease: 'none',
              scrollTrigger: { trigger: item, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
            },
          );
        });
      });
      return () => mm.revert();
    });
  }, [items]);

  return (
    <>
      <div className="galeria">
        <div className="galeria-rejilla" ref={rejillaRef}>
          {items.map((t, i) => (
            <button
              key={t.id}
              type="button"
              className={`galeria-item galeria-item--${t.ancho} reveal`}
              style={{
                '--delay': `${(i % 3) * 0.08}s`,
                ...(i === items.length - 1 && extraUltima > 0 ? { '--extra': extraUltima } : null),
              } as CSSProperties}
              aria-haspopup="dialog"
              onClick={(e) => abrir(i, e.currentTarget)}
            >
              <span className="galeria-medio">
                <img
                  src={t.src}
                  srcSet={t.srcSet}
                  sizes="(min-width: 901px) 34vw, 100vw"
                  alt={t.alt}
                  width={t.anchoPx}
                  height={t.altoPx}
                  loading="lazy"
                  decoding="async"
                />
              </span>
              <span className="galeria-ampliar" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
              </span>
              <span className="sr-only">. Ampliar imagen</span>
            </button>
          ))}
        </div>
      </div>
      <TrabajosVisor items={items} indice={abierto} onCambiar={setAbierto} onCerrar={cerrar} />
    </>
  );
}

// ── Sección ───────────────────────────────────────────────────
export default function Trabajos() {
  const ref = useReveal();
  const hayFotos = TRABAJOS.length > 0;

  return (
    <section
      id="trabajos"
      ref={ref}
      className={`trabajos topo-bg ${hayFotos ? 'trabajos--galeria' : 'trabajos--indice'}`}
      aria-labelledby="trabajos-titulo"
    >
      <div className="container">
        {hayFotos ? (
          <>
            <header className="trabajos-cab">
              <Eyebrow />
              <h2 id="trabajos-titulo" className="display-2 reveal" style={{ '--delay': '0.08s' } as CSSProperties}>
                Trabajos <span className="trabajos-acento">realizados</span>
              </h2>
              <p className="lead reveal" style={{ '--delay': '0.16s' } as CSSProperties}>
                Cada terreno plantea un reto distinto. Una selección de nuestros trabajos.
              </p>
            </header>
            <Galeria items={TRABAJOS} />
            <div className="trabajos-cierre reveal">
              <p className="trabajos-cierre-texto">¿Tienes un terreno que preparar? Cuéntanos el tuyo.</p>
              <Acciones />
            </div>
          </>
        ) : (
          <div className="trabajos-composicion">
            <div className="trabajos-texto">
              <Eyebrow />
              <h2 id="trabajos-titulo" className="display-2 reveal" style={{ '--delay': '0.08s' } as CSSProperties}>
                Cada terreno plantea un <span className="trabajos-acento">reto distinto</span>
              </h2>
              <p className="lead reveal" style={{ '--delay': '0.16s' } as CSSProperties}>
                Cuéntanos el tuyo: elige el tipo de trabajo y te preparamos un presupuesto sin compromiso.
              </p>
              <div className="reveal" style={{ '--delay': '0.24s' } as CSSProperties}>
                <Acciones />
              </div>
            </div>
            <IndiceTrabajos />
          </div>
        )}
      </div>
    </section>
  );
}
