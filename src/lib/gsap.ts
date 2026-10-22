import type { gsap as GsapLib } from 'gsap';
import type { ScrollTrigger as ScrollTriggerLib } from 'gsap/ScrollTrigger';

// GSAP solo anima extras (parallax, línea de proceso). Se descarga aparte, con el
// navegador libre, para que no pese en el JavaScript crítico del primer pintado.

export interface Gsap {
  gsap: typeof GsapLib;
  ScrollTrigger: typeof ScrollTriggerLib;
}

let carga: Promise<Gsap> | null = null;

function cargarGsap(): Promise<Gsap> {
  carga ??= Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([g, s]) => {
    g.gsap.registerPlugin(s.ScrollTrigger);
    return { gsap: g.gsap, ScrollTrigger: s.ScrollTrigger };
  });
  return carga;
}

/**
 * Ejecuta `crear` cuando GSAP está disponible. Devuelve la función de limpieza
 * para el `useEffect`: cancela la espera si el componente se desmonta antes y,
 * si ya se ejecutó, llama a la limpieza que devolvió `crear` (p. ej. `mm.revert()`).
 */
export function conGsap(crear: (g: Gsap) => (() => void) | void): () => void {
  let cancelado = false;
  let limpiar: (() => void) | void;

  const arrancar = () => {
    void cargarGsap().then((g) => {
      if (!cancelado) limpiar = crear(g);
    });
  };

  const idle = typeof window.requestIdleCallback === 'function'
    ? window.requestIdleCallback(arrancar, { timeout: 1500 })
    : window.setTimeout(arrancar, 300);

  return () => {
    cancelado = true;
    if (typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idle);
    else window.clearTimeout(idle);
    limpiar?.();
  };
}
