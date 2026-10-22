import type { CSSProperties, MouseEvent } from 'react';
import { useReveal } from '../hooks/useReveal';
import { scrollToId } from '../lib/motion';
import { INFO_EMPRESA, ZONA, whatsappHref } from '../data/empresa';
import { CREDENCIALES } from '../data/credenciales';
import { SERVICIOS } from '../data/servicios';
import { IconoWhatsApp } from './IconosContacto';
import './Empresa.css';

// Mensaje inicial del chat: la persona lo completa y lo envía ella misma desde WhatsApp.
const WHATSAPP_HREF = whatsappHref('Hola, quería pedir presupuesto para un trabajo.');

export default function Empresa() {
  const ref = useReveal();

  const irA = (e: MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault();
    scrollToId(hash);
  };

  return (
    <section id="empresa" ref={ref} className="empresa topo-bg" aria-labelledby="empresa-titulo">
      <div className="container empresa-layout">
        {/* Texto */}
        <div className="empresa-texto">
          <p className="eyebrow reveal">
            <span className="eyebrow-num">04</span>
            <span className="eyebrow-line" aria-hidden="true" />
            Empresa
          </p>

          <h2 id="empresa-titulo" className="display-2 reveal" style={{ '--delay': '0.08s' } as CSSProperties}>
            Fran Sánchez <span className="empresa-acento">Excavaciones</span>
          </h2>

          <div className="empresa-cuerpo reveal" style={{ '--delay': '0.16s' } as CSSProperties}>
            <p className="lead">
              Empresa de excavaciones y movimientos de tierra{ZONA ? ` en ${ZONA}` : ''}. Hacemos excavaciones para
              cimentaciones y piscinas, demoliciones y limpieza de escombros, solares y tierras.
            </p>
            <p className="empresa-enfoque">
              Cada terreno plantea un reto distinto. Por eso, antes de empezar, valoramos el trabajo y seleccionamos la
              solución y la maquinaria adecuada.
            </p>
          </div>

          <figure className="empresa-lema reveal" style={{ '--delay': '0.24s' } as CSSProperties}>
            <blockquote>{INFO_EMPRESA.lema}</blockquote>
          </figure>

          {/* Solo se pinta si hay datos confirmados por el titular (src/data/credenciales.ts) */}
          {CREDENCIALES.length > 0 && (
            <dl className="empresa-cifras reveal">
              {CREDENCIALES.map((c) => (
                <div key={c.etiqueta} className="empresa-cifra">
                  <dt className="empresa-cifra-etiqueta">{c.etiqueta}</dt>
                  <dd className="empresa-cifra-valor">{c.valor}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="empresa-acciones reveal" style={{ '--delay': '0.32s' } as CSSProperties}>
            <a href="#contacto" className="btn btn-primary" onClick={(e) => irA(e, '#contacto')}>
              Contactar con Fran
            </a>
            <a
              href={WHATSAPP_HREF}
              className="btn btn-outline"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Escribir por WhatsApp (se abre en una pestaña nueva)"
            >
              <IconoWhatsApp size={20} />
              <span>Escribir por WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Marco técnico con el logotipo ilustrado de la marca */}
        <div className="empresa-visual reveal-right">
          <div className="empresa-plano tech-frame">
            <span className="empresa-plano__topo" aria-hidden="true" />
            <svg className="empresa-cota empresa-cota--h" viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 4H100M0.5 0V8M99.5 0V8" fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            </svg>
            <svg className="empresa-cota empresa-cota--v" viewBox="0 0 8 100" preserveAspectRatio="none" aria-hidden="true">
              <path d="M4 0V100M0 0.5H8M0 99.5H8" fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            </svg>
            {/* Cruces de registro en las esquinas libres (las otras dos las pone .tech-frame) */}
            <span className="empresa-reg empresa-reg--tr" aria-hidden="true" />
            <span className="empresa-reg empresa-reg--bl" aria-hidden="true" />

            <img
              className="empresa-logo"
              src="/images/logo-fran-sanchez-640.webp"
              srcSet="/images/logo-fran-sanchez-640.webp 640w, /images/logo-fran-sanchez-1200.webp 1200w"
              sizes="(min-width: 1024px) 38vw, 90vw"
              width={640}
              height={427}
              alt="Logotipo de Fran Sánchez Excavaciones y Movimientos de Tierra, con una retroexcavadora amarilla"
              loading="lazy"
              decoding="async"
            />
          </div>

          {/* Cajetín de plano con datos acreditados */}
          <dl className="empresa-cajetin">
            <div>
              <dt>Empresa</dt>
              <dd>{INFO_EMPRESA.nombre}</dd>
            </div>
            <div>
              <dt>Actividad</dt>
              <dd>Excavaciones y movimientos de tierra</dd>
            </div>
            {ZONA && (
              <div>
                <dt>Zona</dt>
                <dd>{ZONA}</dd>
              </div>
            )}
            <div>
              <dt>Trabajos</dt>
              <dd>
                <a href="#servicios" onClick={(e) => irA(e, '#servicios')}>
                  {SERVICIOS.length} tipos de trabajo
                </a>
              </dd>
            </div>
            <div>
              <dt>Teléfono</dt>
              <dd>
                <a href={INFO_EMPRESA.telefonoHref}>{INFO_EMPRESA.telefono}</a>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
