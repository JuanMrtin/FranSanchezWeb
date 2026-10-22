import { useEffect, type CSSProperties, type MouseEvent, type PointerEvent } from 'react';
import { SERVICIOS, INFO_EMPRESA, type Servicio } from '../data/servicios';
import { useReveal } from '../hooks/useReveal';
import { conGsap } from '../lib/gsap';
import { scrollToId } from '../lib/motion';
import { Pictograma } from './pictogramas';
import './Servicios.css';

// Tamaño de cada tarjeta en la rejilla asimétrica de escritorio, en zigzag (7+5 · 5+7 · 7+5)
const TAMANOS = ['l', 'm', 'm', 'l', 'l', 'm'] as const;

const pad = (n: number) => String(n).padStart(2, '0');

/** Rellena el desplegable de Contacto con este servicio y baja al formulario. */
function solicitarPresupuesto(e: MouseEvent<HTMLAnchorElement>, servicio: string) {
  e.preventDefault();
  window.dispatchEvent(new CustomEvent('fs:servicio', { detail: { servicio } }));
  scrollToId('#contacto');
}

function irA(e: MouseEvent<HTMLAnchorElement>, hash: string) {
  e.preventDefault();
  scrollToId(hash);
}

/** Resplandor que sigue al cursor: solo ratón real (en táctil no hay hover). */
function seguirCursor(e: PointerEvent<HTMLElement>) {
  if (e.pointerType !== 'mouse') return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty('--mx', `${e.clientX - r.left}px`);
  el.style.setProperty('--my', `${e.clientY - r.top}px`);
}

function IconoFlecha() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

// ── Composición gráfica de la cabecera ────────────────────────
// Plano con curvas de nivel, el «02» contorneado y un cuadro-resumen por familias.
// Cada fila lleva a la tarjeta de ese servicio.
function ResumenTrabajos() {
  return (
    <div className="srv-plano tech-frame reveal" style={{ '--delay': '0.14s' } as CSSProperties}>
      <span className="srv-plano__topo" aria-hidden="true">
        <span className="srv-plano__num">02</span>
      </span>
      <span className="srv-plano__escala" aria-hidden="true" />

      <p className="srv-plano__cab" aria-hidden="true">
        <span>Tipos de trabajo</span>
        <span className="srv-plano__total">{pad(SERVICIOS.length)}</span>
      </p>

      <ul className="srv-plano__lista" role="list" aria-label="Servicios">
        {SERVICIOS.map((sv, i) => (
          <li key={sv.id}>
            <a
              href={`#srv-${sv.id}`}
              className="srv-plano__fila"
              onClick={(e) => irA(e, `#srv-${sv.id}`)}
            >
              <span className="srv-plano__n" aria-hidden="true">{pad(i + 1)}</span>
              <span className="srv-plano__nombre">{sv.titulo}</span>
              <span className="srv-plano__flecha" aria-hidden="true"><IconoFlecha /></span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Tarjeta de servicio ───────────────────────────────────────
function TarjetaServicio({ servicio, index }: { servicio: Servicio; index: number }) {
  const { id, titulo, descripcion, imagen } = servicio;
  const tamano = TAMANOS[index] ?? 's';

  return (
    <li
      id={`srv-${id}`}
      className="srv-item reveal"
      data-size={tamano}
      style={{ '--delay': `${(index % 3) * 0.08}s` } as CSSProperties}
    >
      <div className="srv-card pg-host" onPointerMove={seguirCursor}>
        <span className="srv-card__glow" aria-hidden="true" />

        <div className="srv-card__top">
          <span className="srv-card__num" aria-hidden="true">{pad(index + 1)}</span>
          <div className="srv-card__picto"><Pictograma id={id} /></div>
        </div>

        {imagen && (
          <figure className="srv-card__media">
            <img src={imagen.src} alt={imagen.alt} loading="lazy" decoding="async" />
          </figure>
        )}

        <div className="srv-card__body">
          <h3 className="srv-card__titulo">{titulo}</h3>
          <p className="srv-card__desc">{descripcion}</p>
        </div>

        <a
          href="#contacto"
          className="srv-card__cta"
          aria-label={`Solicitar presupuesto de ${titulo.toLowerCase()}`}
          onClick={(e) => solicitarPresupuesto(e, titulo)}
        >
          <span>Solicitar presupuesto</span>
          <IconoFlecha />
        </a>

        <span className="srv-card__linea" aria-hidden="true" />
      </div>
    </li>
  );
}

// ── Sección ───────────────────────────────────────────────────
export default function Servicios() {
  const sectionRef = useReveal();

  // Parallax suave solo en escritorio y con movimiento permitido.
  // matchMedia de GSAP revierte todo (tweens y ScrollTriggers) al desmontar o al cambiar la condición.
  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    return conGsap(({ gsap }) => {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
        const cab = root.querySelector('.srv-cab');
        const numero = root.querySelector('.srv-plano__num');
        const topo = root.querySelector('.srv-topo');

        // El «02» del plano se desplaza algo más despacio que el scroll
        if (cab && numero) {
          gsap.fromTo(
            numero,
            { yPercent: -5 },
            { yPercent: 9, ease: 'none', scrollTrigger: { trigger: cab, start: 'top bottom', end: 'bottom top', scrub: true } },
          );
        }
        // Curvas de nivel del fondo con un desplazamiento mínimo para dar profundidad
        if (topo) {
          gsap.fromTo(
            topo,
            { yPercent: -3 },
            { yPercent: 3, ease: 'none', scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true } },
          );
        }
      });

      return () => mm.revert();
    });
  }, [sectionRef]);

  return (
    <section id="servicios" className="srv" ref={sectionRef} aria-labelledby="servicios-titulo">
      <div className="srv-topo" aria-hidden="true" />
      <span className="srv-rule tech-rule" aria-hidden="true" />

      <div className="container">
        {/* Cabecera compacta: titular a la izquierda, composición gráfica a la derecha */}
        <header className="srv-cab">
          <div className="srv-cab__copy">
            <p className="eyebrow reveal">
              <span className="eyebrow-num">02</span>
              <span className="eyebrow-line" aria-hidden="true" />
              Servicios
            </p>
            <h2 id="servicios-titulo" className="srv-title reveal" style={{ '--delay': '0.08s' } as CSSProperties}>
              <span>Excavar.</span>{' '}
              <span>Derribar.</span>{' '}
              <span className="srv-title__acc">Limpiar.</span>
            </h2>
            <p className="lead srv-lead reveal" style={{ '--delay': '0.18s' } as CSSProperties}>
              Movimientos de tierra y trabajos de preparación de terrenos con maquinaria.
              Elige el tipo de trabajo que necesitas y pide presupuesto.
            </p>
          </div>

          <ResumenTrabajos />
        </header>

        {/* Rejilla de tipos de trabajo */}
        <div className="srv-head" id="servicios-indice">
          <p className="eyebrow reveal">
            <span className="eyebrow-num">02.1</span>
            <span className="eyebrow-line" aria-hidden="true" />
            Tipos de trabajo
          </p>
          <p className="srv-head__text reveal" style={{ '--delay': '0.08s' } as CSSProperties}>
            Cada tarjeta lleva el servicio elegido al formulario de contacto.
          </p>
        </div>

        <ul className="srv-grid tech-frame" role="list">
          {SERVICIOS.map((s, i) => (
            <TarjetaServicio key={s.id} servicio={s} index={i} />
          ))}
        </ul>

        <div className="srv-cta">
          <p className="srv-cta__text reveal">
            Cuéntanos qué terreno<br />hay que preparar.
          </p>
          <div className="srv-cta__actions reveal" style={{ '--delay': '0.1s' } as CSSProperties}>
            <a
              href="#contacto"
              className="btn btn-primary"
              onClick={(e) => irA(e, '#contacto')}
            >
              <span>Solicitar presupuesto</span>
              <IconoFlecha />
            </a>
            <a href={INFO_EMPRESA.telefonoHref} className="btn btn-outline">
              <span>Llamar al {INFO_EMPRESA.telefono}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
