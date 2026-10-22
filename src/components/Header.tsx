import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, MouseEvent } from 'react';
import { INFO_EMPRESA, NAV_LINKS } from '../data/empresa';
import { esClicNormal } from '../lib/enlaces';
import { scrollToId } from '../lib/motion';
import { lockScroll } from '../lib/scrollLock';
import { IconoTelefono } from './IconosContacto';
import './Header.css';

// A partir de este ancho se muestra la navegación completa (debe coincidir con Header.css).
const MQ_ESCRITORIO = '(min-width: 1025px)';

// Sección observada → enlace de navegación al que pertenece.
// «Proceso» no tiene enlace propio: cuenta como «Empresa».
const SECCION_A_ENLACE = new Map<string, string>([
  ...NAV_LINKS.map((l): [string, string] => [l.href.slice(1), l.href]),
  ['proceso', '#empresa'],
]);

const num = (i: number) => String(i + 1).padStart(2, '0');

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [activo, setActivo] = useState('#inicio');

  const centinelaRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const botonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  // Superficie oscura al salir del hero: un centinela en lo alto del documento
  // evita escuchar «scroll» y solo hay re-render cuando cambia el estado.
  useEffect(() => {
    const el = centinelaRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entrada]) => setScrolled(!entrada.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Enlace activo según la sección que cruza una línea al 45 % del viewport.
  useEffect(() => {
    const ids = [...SECCION_A_ENLACE.keys()];
    const secciones = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (!secciones.length) return;

    const visibles = new Set<string>();
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) visibles.add(e.target.id);
          else visibles.delete(e.target.id);
        }
        // Si ninguna cruza la línea (p. ej. sobre el pie) se mantiene la última.
        const ultima = ids.filter((id) => visibles.has(id)).pop();
        const enlace = ultima ? SECCION_A_ENLACE.get(ultima) : undefined;
        if (enlace) setActivo(enlace);
      },
      { rootMargin: '-45% 0px -54% 0px' },
    );
    secciones.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  const cerrarMenu = useCallback((devolverFoco: boolean) => {
    // El foco vuelve al botón antes de que el panel pase a inert.
    if (devolverFoco) botonRef.current?.focus({ preventScroll: true });
    setMenuAbierto(false);
  }, []);

  // Menú abierto: bloquea scroll, deja inertes el resto de la página, mueve el foco,
  // cierra con Escape y al pasar a escritorio. Todo se deshace en la limpieza.
  useEffect(() => {
    if (!menuAbierto) return;
    const header = headerRef.current;
    if (!header) return;

    const desbloquear = lockScroll();

    const resto = Array.from(header.parentElement?.children ?? []).filter(
      (el): el is HTMLElement => el instanceof HTMLElement && el !== header && !el.inert,
    );
    resto.forEach((el) => { el.inert = true; });

    panelRef.current?.querySelector<HTMLElement>('a[href]')?.focus({ preventScroll: true });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        cerrarMenu(true);
      }
    };
    document.addEventListener('keydown', onKeyDown);

    const mq = window.matchMedia(MQ_ESCRITORIO);
    const onMq = () => { if (mq.matches) cerrarMenu(false); };
    mq.addEventListener('change', onMq);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      mq.removeEventListener('change', onMq);
      resto.forEach((el) => { el.inert = false; });
      desbloquear();
    };
  }, [menuAbierto, cerrarMenu]);

  // Foco atrapado: Tab y Mayús+Tab dan la vuelta dentro de la cabecera mientras el menú está abierto.
  const atraparTab = (e: ReactKeyboardEvent<HTMLElement>) => {
    if (!menuAbierto || e.key !== 'Tab') return;
    const enfocables = Array.from(
      e.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
    ).filter((el) => el.getClientRects().length > 0 && !el.closest('[inert]'));
    if (!enfocables.length) return;
    const primero = enfocables[0];
    const ultimo = enfocables[enfocables.length - 1];
    const actual = document.activeElement;
    if (e.shiftKey && (actual === primero || !e.currentTarget.contains(actual))) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && (actual === ultimo || !e.currentTarget.contains(actual))) {
      e.preventDefault();
      primero.focus();
    }
  };

  // Enlace real (#id) que se gestiona con scroll suave; con teclas modificadoras se deja al navegador.
  const irA = (e: MouseEvent<HTMLAnchorElement>, hash: string, desdeMenu = false) => {
    if (!esClicNormal(e)) return;
    e.preventDefault();
    if (desdeMenu) cerrarMenu(true);
    scrollToId(hash);
  };

  const claseHeader = ['site-header', scrolled && 'hdr--scrolled', menuAbierto && 'hdr--open']
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <div ref={centinelaRef} className="hdr-sentinel" aria-hidden="true" />

      <header ref={headerRef} className={claseHeader} onKeyDown={atraparTab}>
        <div className="hdr-inner container">
          {/* Logotipo ilustrado de la empresa (insignia 3:2 con transparencia).
              Es lo primero que se pinta: se carga ya y con prioridad alta. */}
          <a href="#inicio" className="hdr-logo" onClick={(e) => irA(e, '#inicio', menuAbierto)}>
            <img
              className="hdr-logo-img"
              src="/images/logo-fran-sanchez-320.webp"
              srcSet="/images/logo-fran-sanchez-160.webp 160w, /images/logo-fran-sanchez-320.webp 320w, /images/logo-fran-sanchez-640.webp 640w"
              sizes="(max-width: 1024px) 78px, 114px"
              width="320"
              height="213"
              alt={INFO_EMPRESA.nombreCompleto}
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
          </a>

          {/* Navegación de escritorio */}
          <nav className="hdr-nav" aria-label="Navegación principal">
            <ul>
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="hdr-link"
                    aria-current={activo === l.href ? 'location' : undefined}
                    onClick={(e) => irA(e, l.href)}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hdr-actions">
            {/* Escritorio: teléfono + presupuesto */}
            <a
              href={INFO_EMPRESA.telefonoHref}
              className="hdr-tel"
              aria-label={`Llamar al ${INFO_EMPRESA.telefono}`}
            >
              <IconoTelefono />
              <span>{INFO_EMPRESA.telefono}</span>
            </a>
            <a href="#contacto" className="btn btn-primary hdr-cta" onClick={(e) => irA(e, '#contacto')}>
              Solicitar presupuesto
            </a>

            {/* Móvil: teléfono siempre visible + hamburguesa */}
            <a
              href={INFO_EMPRESA.telefonoHref}
              className="hdr-icon-btn hdr-phone"
              aria-label={`Llamar al ${INFO_EMPRESA.telefono}`}
            >
              <IconoTelefono />
            </a>
            <button
              ref={botonRef}
              type="button"
              className="hdr-icon-btn hdr-burger"
              aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuAbierto}
              aria-controls={panelId}
              onClick={() => (menuAbierto ? cerrarMenu(false) : setMenuAbierto(true))}
            >
              <span className="hdr-burger-bar" />
              <span className="hdr-burger-bar" />
              <span className="hdr-burger-bar" />
            </button>
          </div>
        </div>

        {/* Panel móvil a pantalla completa (inert mientras está cerrado) */}
        <div ref={panelRef} id={panelId} className="hdr-panel" inert={!menuAbierto}>
          <div className="hdr-panel-inner container">
            <nav aria-label="Navegación principal">
              <ul className="hdr-panel-list">
                {NAV_LINKS.map((l, i) => (
                  <li key={l.href} style={{ '--i': i } as CSSProperties}>
                    <a
                      href={l.href}
                      className="hdr-panel-link"
                      aria-current={activo === l.href ? 'location' : undefined}
                      onClick={(e) => irA(e, l.href, true)}
                    >
                      <span className="hdr-panel-num" aria-hidden="true">{num(i)}</span>
                      <span className="hdr-panel-label">{l.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="hdr-panel-foot">
              <p className="hdr-panel-lema">{INFO_EMPRESA.lema}</p>
              <a href={INFO_EMPRESA.telefonoHref} className="btn btn-primary">
                <IconoTelefono />
                Llamar al {INFO_EMPRESA.telefono}
              </a>
              <a href="#contacto" className="btn btn-outline" onClick={(e) => irA(e, '#contacto', true)}>
                Solicitar presupuesto
              </a>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
