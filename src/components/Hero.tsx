import { useEffect, useRef } from 'react';
import { INFO_EMPRESA, ZONA } from '../data/empresa';
import { conGsap } from '../lib/gsap';
import { scrollToId } from '../lib/motion';
import './Hero.css';

// Trabajos destacados (de la lista acreditada de servicios) como enlaces internos
const DESTACADOS = ['Cimentaciones', 'Piscinas', 'Demolición', 'Escombros', 'Solares y tierras'];

export default function Hero() {
  const bgRef = useRef<HTMLDivElement>(null);

  // Parallax muy suave con el scroll: solo escritorio y con movimiento permitido
  useEffect(() => {
    const bg = bgRef.current;
    if (!bg) return;

    return conGsap(({ gsap }) => {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference) and (hover: hover)', () => {
        const trigger = { trigger: '#inicio', start: 'top top', end: 'bottom top', scrub: 0.6 };
        gsap.to(bg, { yPercent: 12, ease: 'none', scrollTrigger: trigger });
      });
      return () => mm.revert();
    });
  }, []);

  return (
    <section id="inicio" className="hero" aria-labelledby="hero-titulo">
      <div className="hero-bg topo-bg" ref={bgRef} aria-hidden="true" />
      <div className="hero-glow" aria-hidden="true" />

      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow">
            <span className="eyebrow-num">01</span>
            <span className="eyebrow-line" aria-hidden="true" />
            Excavaciones · Movimientos de tierra
            {ZONA && <span className="hero-eyebrow-zona"> · {ZONA}</span>}
          </p>

          <h1 id="hero-titulo" className="display-1 hero-title">
            <span className="sr-only">
              Fran Sánchez Excavaciones y Movimientos de Tierra{ZONA ? ` en ${ZONA}` : ''}.{' '}
            </span>
            <span className="hero-title-line">Preparamos<br />el terreno.</span>
            <em className="hero-title-em">Construimos<br />el siguiente paso.</em>
          </h1>

          <p className="hero-lead">
            Excavaciones y movimientos de tierra para preparar cada terreno
            y hacer realidad tu proyecto.
          </p>

          <div className="hero-actions">
            <a
              href="#contacto"
              className="btn btn-primary btn-lg"
              onClick={(e) => { e.preventDefault(); scrollToId('#contacto'); }}
            >
              <span>Solicitar presupuesto</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <a href={INFO_EMPRESA.telefonoHref} className="btn btn-outline btn-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
              </svg>
              <span>Llamar al {INFO_EMPRESA.telefono}</span>
            </a>
          </div>

          <ul className="hero-tags" aria-label="Trabajos principales">
            {DESTACADOS.map((t) => (
              <li key={t}>
                <a href="#servicios" onClick={(e) => { e.preventDefault(); scrollToId('#servicios'); }}>
                  {t}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* La máquina del logotipo en trazo fino: misma ilustración, versión minimalista */}
        <div className="hero-linea" aria-hidden="true">
          <img
            src="/images/hero-logo-lineas-560.webp"
            srcSet="/images/hero-logo-lineas-560.webp 560w, /images/hero-logo-lineas-800.webp 800w, /images/hero-logo-lineas-1000.webp 1000w"
            sizes="(min-width: 1100px) 46vw, 100vw"
            width={1000}
            height={449}
            alt=""
            fetchPriority="low"
            decoding="async"
          />
        </div>

      </div>

      {/* Detalles técnicos: escala y regla. Decorativos, sin datos. */}
      <div className="hero-scale" aria-hidden="true">
        <span className="hero-scale-bar" />
        <span className="hero-scale-label">Escala 1:1 000</span>
      </div>
      <span className="hero-index" aria-hidden="true">01</span>

      <button
        type="button"
        className="hero-cue"
        aria-label="Ir a servicios"
        onClick={() => scrollToId('#servicios')}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </button>
    </section>
  );
}
