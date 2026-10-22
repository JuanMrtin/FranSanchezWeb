import type { MouseEvent } from 'react';
import { scrollToId } from './motion';

/** true si es un clic principal sin teclas modificadoras (con Ctrl/Cmd/Mayús se deja actuar al navegador). */
export function esClicNormal(e: MouseEvent): boolean {
  return !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}

/** Enlace interno (#id) con scroll suave que respeta «reducir movimiento» y el offset del header. */
export function irASeccion(e: MouseEvent<HTMLAnchorElement>, hash: string): void {
  if (!esClicNormal(e)) return;
  e.preventDefault();
  scrollToId(hash);
}
