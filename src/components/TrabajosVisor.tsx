import { useEffect, useRef } from 'react';
import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react';
import type { Trabajo } from '../data/trabajos';
import { lockScroll } from '../lib/scrollLock';

// Vista ampliada de la galería con <dialog> nativo: el navegador aporta
// modalidad, atrapa el foco y gestiona Escape. Aquí se añaden flechas, contador,
// precarga de vecinas y gesto de deslizar en táctil.

interface VisorProps {
  items: Trabajo[];
  /** Índice abierto, o null con el visor cerrado. */
  indice: number | null;
  onCambiar: (indice: number) => void;
  onCerrar: () => void;
}

const UMBRAL_SWIPE = 56;

const pad = (n: number) => String(n).padStart(2, '0');

export default function TrabajosVisor({ items, indice, onCambiar, onCerrar }: VisorProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inicioRef = useRef<{ x: number; y: number } | null>(null);
  const total = items.length;
  const abierto = indice !== null;

  // Abre/cierra el diálogo nativo según el estado y bloquea el scroll de fondo
  // con el bloqueo compartido (reserva el hueco de la barra: sin saltos de layout).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (abierto && !dialog.open) dialog.showModal();
    if (!abierto && dialog.open) dialog.close();
    if (!abierto) return;
    return lockScroll();
  }, [abierto]);

  // Si el componente se desmonta con el visor abierto, se cierra limpiamente.
  useEffect(() => {
    const dialog = dialogRef.current;
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  // Precarga de las imágenes vecinas para que las flechas respondan al instante.
  useEffect(() => {
    if (indice === null || total < 2) return;
    for (const salto of [-1, 1]) {
      const vecina = items[(indice + salto + total) % total];
      const img = new Image();
      img.src = vecina.srcAmpliada ?? vecina.src;
    }
  }, [indice, items, total]);

  const ir = (salto: number) => {
    if (indice === null || total < 2) return;
    onCambiar((indice + salto + total) % total);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      ir(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      ir(1);
    } else if (e.key === 'Home' && total > 1) {
      e.preventDefault();
      onCambiar(0);
    } else if (e.key === 'End' && total > 1) {
      e.preventDefault();
      onCambiar(total - 1);
    }
  };

  // Clic en el fondo cierra: el propio <dialog> o los huecos vacíos de la escena
  // (la imagen, el pie y los botones no cierran).
  const onClickFondo = (e: MouseEvent<HTMLDialogElement>) => {
    const t = e.target as HTMLElement;
    if (t === dialogRef.current || t.classList.contains('visor-escena') || t.classList.contains('visor-barra')) onCerrar();
  };

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType === 'mouse') return;
    inicioRef.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: PointerEvent<HTMLElement>) => {
    const inicio = inicioRef.current;
    inicioRef.current = null;
    if (!inicio) return;
    const dx = e.clientX - inicio.x;
    const dy = e.clientY - inicio.y;
    if (Math.abs(dx) > UMBRAL_SWIPE && Math.abs(dx) > Math.abs(dy) * 1.5) ir(dx < 0 ? 1 : -1);
  };

  const actual = indice !== null ? items[indice] : null;

  return (
    <dialog
      ref={dialogRef}
      className="visor"
      aria-label="Vista ampliada de trabajos"
      onClose={onCerrar}
      onKeyDown={onKeyDown}
      onClick={onClickFondo}
    >
      {actual && indice !== null && (
        <>
          <div className="visor-barra">
            <p className="visor-contador" role="status">
              <span className="visor-contador-actual">{pad(indice + 1)}</span>
              <span aria-hidden="true"> / </span>
              <span className="sr-only"> de </span>
              {pad(total)}
            </p>
            <button type="button" className="visor-btn visor-cerrar" onClick={onCerrar} autoFocus>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
              <span className="sr-only">Cerrar vista ampliada</span>
            </button>
          </div>

          <div className="visor-escena">
            {total > 1 && (
              <button type="button" className="visor-btn visor-prev" onClick={() => ir(-1)}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                <span className="sr-only">Imagen anterior</span>
              </button>
            )}

            <figure className="visor-figura" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
              <img
                key={actual.id}
                className="visor-img"
                src={actual.srcAmpliada ?? actual.src}
                alt={actual.alt}
                width={actual.anchoPx}
                height={actual.altoPx}
                decoding="async"
                draggable={false}
              />
            </figure>

            {total > 1 && (
              <button type="button" className="visor-btn visor-next" onClick={() => ir(1)}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="m9 18 6-6-6-6" />
                </svg>
                <span className="sr-only">Imagen siguiente</span>
              </button>
            )}
          </div>
        </>
      )}
    </dialog>
  );
}
