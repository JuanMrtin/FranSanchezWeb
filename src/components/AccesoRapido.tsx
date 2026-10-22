import { useEffect, useState } from 'react';
import { INFO_EMPRESA } from '../data/empresa';
import { WHATSAPP_SALUDO_HREF } from '../lib/saludoWhatsApp';
import { useScrollBloqueado } from '../lib/scrollLock';
import { IconoTelefono, IconoWhatsApp } from './IconosContacto';
import './AccesoRapido.css';

/**
 * true mientras el elemento (selector) cruza el viewport, vigilado con un IntersectionObserver
 * (nada de listeners de scroll). Parte de `inicial` hasta que el observador da su primera lectura.
 */
function useEnVista(selector: string, rootMargin: string, inicial: boolean): boolean {
  const [enVista, setEnVista] = useState(inicial);

  useEffect(() => {
    const el = document.querySelector(selector);
    if (!el) return;
    const io = new IntersectionObserver(
      (entradas) => {
        const ultima = entradas[entradas.length - 1];
        if (ultima) setEnVista(ultima.isIntersecting);
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [selector, rootMargin]);

  return enVista;
}

/**
 * Botones flotantes de conversión: «Llamar» y «WhatsApp», en la esquina inferior derecha.
 * Móvil: dos círculos de 52 px. Escritorio (≥1025 px): píldoras con texto. Aparecen al dejar
 * atrás el hero (que ya trae sus propios botones) y se apartan mientras la sección de contacto
 * está a la vista (ya ofrece los mismos canales) y mientras hay una capa abierta (menú móvil, diálogos).
 */
export default function AccesoRapido() {
  // Banda superior del viewport: el hero se da por «dejado atrás» cuando solo queda su borde inferior.
  const heroEnVista = useEnVista('#inicio', '-30% 0px 0px 0px', true);
  const enContacto = useEnVista('#contacto', '0px 0px -10% 0px', false);
  const capaAbierta = useScrollBloqueado();

  const visible = !capaAbierta && !enContacto && !heroEnVista;

  return (
    <div
      className={visible ? 'fab fab--visible' : 'fab'}
      role="group"
      aria-label="Contacto rápido"
    >
      <a
        href={INFO_EMPRESA.telefonoHref}
        className="fab-btn fab-btn--llamar"
        aria-label={`Llamar al ${INFO_EMPRESA.telefono}`}
      >
        <IconoTelefono size={22} />
        <span className="fab-label">Llamar</span>
      </a>
      <a
        href={WHATSAPP_SALUDO_HREF}
        className="fab-btn fab-btn--whatsapp"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escribir por WhatsApp (se abre en una pestaña nueva)"
      >
        <IconoWhatsApp size={24} />
        <span className="fab-label">WhatsApp</span>
      </a>
    </div>
  );
}
