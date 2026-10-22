// ── Bloqueo del scroll del documento (menú móvil, diálogo legal) ──
// Con contador: si dos capas piden el bloqueo a la vez, solo se libera al soltar la última.
// Reservamos el hueco de la barra de scroll para que el layout no cambie de ancho
// al bloquear: nada de saltos.

import { useSyncExternalStore } from 'react';

let bloqueos = 0;
let liberar: (() => void) | null = null;

// Quien necesite saber si hay una capa superpuesta abierta (p. ej. los botones
// flotantes, que se apartan mientras el menú o el diálogo ocupan la pantalla)
// se suscribe aquí en lugar de espiar el DOM.
const oyentes = new Set<() => void>();
const avisar = () => oyentes.forEach((cb) => cb());

function suscribir(cb: () => void): () => void {
  oyentes.add(cb);
  return () => { oyentes.delete(cb); };
}
const estaBloqueado = () => bloqueos > 0;

/** true mientras el scroll del documento esté bloqueado (menú móvil o diálogo abiertos). */
export function useScrollBloqueado(): boolean {
  return useSyncExternalStore(suscribir, estaBloqueado, () => false);
}

function aplicar(): () => void {
  const html = document.documentElement;
  const body = document.body;
  const prev = {
    overflow: body.style.overflow,
    padding: body.style.paddingRight,
    gutter: html.style.scrollbarGutter,
  };

  const anchoBarra = window.innerWidth - html.clientWidth;
  const soportaGutter = typeof CSS !== 'undefined' && CSS.supports('scrollbar-gutter', 'stable');

  if (soportaGutter) {
    html.style.scrollbarGutter = 'stable';
  } else if (anchoBarra > 0) {
    // Navegadores sin scrollbar-gutter: compensamos con padding.
    const actual = parseFloat(getComputedStyle(body).paddingRight) || 0;
    body.style.paddingRight = `${actual + anchoBarra}px`;
  }
  body.style.overflow = 'hidden';

  return () => {
    body.style.overflow = prev.overflow;
    body.style.paddingRight = prev.padding;
    html.style.scrollbarGutter = prev.gutter;
  };
}

/** Bloquea el scroll del body. Devuelve la función que lo libera (idempotente). */
export function lockScroll(): () => void {
  bloqueos += 1;
  if (bloqueos === 1) {
    liberar = aplicar();
    avisar();
  }

  let soltado = false;
  return () => {
    if (soltado) return;
    soltado = true;
    bloqueos -= 1;
    if (bloqueos === 0 && liberar) {
      liberar();
      liberar = null;
      avisar();
    }
  };
}
