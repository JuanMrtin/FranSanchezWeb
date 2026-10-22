import { useEffect, useRef } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import { useReveal } from '../hooks/useReveal';
import { conGsap } from '../lib/gsap';
import { scrollToId } from '../lib/motion';
import { INFO_EMPRESA, whatsappHref } from '../data/empresa';
import { DATOS_PRESUPUESTO, PASOS_PROCESO } from '../data/proceso';
import { IconoWhatsApp } from './IconosContacto';
import './Proceso.css';


const pad = (n: number) => String(n).padStart(2, '0');

// Mensaje inicial del chat: la persona lo completa y lo envía ella misma desde WhatsApp.
const WHATSAPP_HREF = whatsappHref('Hola, quería pedir presupuesto para un trabajo.');

export default function Proceso() {
  const ref = useReveal();
  const listaRef = useRef<HTMLOListElement>(null);

  // La línea se dibuja con el scroll y activa cada nodo al alcanzarlo.
  // Horizontal en escritorio, vertical en móvil (lo decide el CSS; aquí solo
  // cambia el tramo de scroll). Sin «reducir movimiento» todo queda estático.
  useEffect(() => {
    const lista = listaRef.current;
    if (!lista) return;
    const nodos = Array.from(lista.querySelectorAll<HTMLElement>('.proceso-paso'));
    const total = nodos.length;
    return conGsap(({ gsap, ScrollTrigger }) => {
      const mm = gsap.matchMedia();

      // Cada nodo dibuja su tramo hacia el siguiente (--seg 0→1) y se enciende al llegar la línea.
      const aplicar = (p: number) => {
        const avance = p * (total - 1);
        nodos.forEach((n, i) => {
          n.style.setProperty('--seg', Math.min(1, Math.max(0, avance - i)).toFixed(3));
          n.classList.toggle('is-on', avance >= i - 0.001);
        });
      };

      const crear = (inicio: string, fin: string) => {
        lista.dataset.anim = 'true';
        const st = ScrollTrigger.create({
          trigger: lista,
          start: inicio,
          end: fin,
          scrub: 0.4,
          onUpdate: (self) => aplicar(self.progress),
        });
        aplicar(st.progress);
        return () => {
          st.kill();
          delete lista.dataset.anim;
          nodos.forEach((n) => {
            n.style.removeProperty('--seg');
            n.classList.add('is-on');
          });
        };
      };

      mm.add('(prefers-reduced-motion: no-preference) and (min-width: 901px)', () => crear('top 72%', 'bottom 42%'));
      mm.add('(prefers-reduced-motion: no-preference) and (max-width: 900px)', () => crear('top 62%', 'bottom 55%'));
      return () => mm.revert();
    });
  }, []);

  const irAContacto = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToId('#contacto');
  };

  return (
    <section id="proceso" ref={ref} className="proceso" aria-labelledby="proceso-titulo">
      <div className="container">
        <header className="proceso-cab">
          <p className="eyebrow reveal">
            <span className="eyebrow-num">05</span>
            <span className="eyebrow-line" aria-hidden="true" />
            Proceso
          </p>
          <h2 id="proceso-titulo" className="display-2 reveal" style={{ '--delay': '0.08s' } as CSSProperties}>
            Del primer contacto a la <span className="proceso-acento">ejecución</span>
          </h2>
          <p className="lead reveal" style={{ '--delay': '0.16s' } as CSSProperties}>
            Un camino claro desde que nos cuentas tu proyecto hasta que empezamos a preparar el terreno.
          </p>
        </header>

        {/* Línea de proceso: nodos numerados unidos por una línea que se dibuja con el scroll */}
        <ol className="proceso-lista" ref={listaRef} role="list">
          {PASOS_PROCESO.map((paso, i) => (
            <li key={paso.titulo} className="proceso-paso is-on reveal" style={{ '--delay': `${i * 0.1}s` } as CSSProperties}>
              <span className="proceso-nodo" aria-hidden="true">
                {pad(i + 1)}
              </span>
              <div className="proceso-texto">
                <h3 className="proceso-paso-titulo">
                  <span className="sr-only">Paso {i + 1}: </span>
                  {paso.titulo}
                </h3>
                <p className="proceso-paso-desc">{paso.descripcion}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* Qué información necesitamos */}
        <div className="proceso-datos tech-frame reveal">
          <div className="proceso-datos-intro">
            <h3 className="display-3">Qué información necesitamos para el presupuesto</h3>
            <p className="proceso-datos-texto">
              Con estos datos podemos valorar tu trabajo y prepararte un presupuesto sin compromiso. Si no los tienes
              todos, cuéntanos lo que sepas.
            </p>
            <div className="proceso-acciones">
              <a href="#contacto" className="btn btn-primary" onClick={irAContacto}>
                Pedir presupuesto
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
            <p className="proceso-llamar">
              <span>O llámanos al</span>
              <a href={INFO_EMPRESA.telefonoHref} className="link-yellow">
                {INFO_EMPRESA.telefono}
              </a>
            </p>
          </div>

          <ul className="proceso-checklist" role="list">
            {DATOS_PRESUPUESTO.map((d) => (
              <li key={d.titulo} className="proceso-dato">
                <span className="proceso-marca" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="m5 12.5 4.5 4.5L19 7.5" />
                  </svg>
                </span>
                <div>
                  <p className="proceso-dato-titulo">
                    {d.titulo}
                    {d.condicion && <span className="proceso-dato-cond"> · {d.condicion}</span>}
                  </p>
                  <p className="proceso-dato-detalle">{d.detalle}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
