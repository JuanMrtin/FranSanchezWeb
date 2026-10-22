import { useSyncExternalStore } from 'react';

// ── Preferencias de movimiento y capacidades del dispositivo ──
// Utilidades compartidas por todas las secciones y por la escena 3D.

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(REDUCED_QUERY).matches;
}

function subscribeMedia(query: string) {
  return (cb: () => void) => {
    const mq = window.matchMedia(query);
    mq.addEventListener('change', cb);
    return () => mq.removeEventListener('change', cb);
  };
}

/** Hook reactivo para cualquier media query. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    subscribeMedia(query),
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export function useReducedMotion(): boolean {
  return useMediaQuery(REDUCED_QUERY);
}

/** true en pantallas táctiles sin hover real (móvil/tablet). */
export function useCoarsePointer(): boolean {
  return useMediaQuery('(hover: none), (pointer: coarse)');
}

export type DeviceTier = 'low' | 'mid' | 'high';

interface NavigatorHints extends Navigator {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
}

/**
 * Estimación gruesa de la potencia del dispositivo para decidir calidad 3D
 * (resolución de render, efectos, textura). No es una medición de FPS.
 */
export function getDeviceTier(): DeviceTier {
  if (typeof navigator === 'undefined') return 'mid';
  const nav = navigator as NavigatorHints;
  const cores = nav.hardwareConcurrency ?? 4;
  const mem = nav.deviceMemory ?? 4;
  const coarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const saveData = nav.connection?.saveData === true || nav.connection?.effectiveType === '2g';
  if (saveData || cores <= 2 || mem <= 2) return 'low';
  if (coarse || cores <= 4 || mem <= 4) return 'mid';
  return 'high';
}

/** Respeta «reducir movimiento» y compensa el header fijo (scroll-padding-top). */
export function scrollToId(hash: string): void {
  const id = hash.startsWith('#') ? hash.slice(1) : hash;
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
}
