import { SERVICIOS } from '../data/servicios';
import { INFO_EMPRESA, NAV_LINKS, ZONA } from '../data/empresa';
import { irASeccion } from '../lib/enlaces';
import { WHATSAPP_SALUDO_HREF } from '../lib/saludoWhatsApp';
import { IconoTelefono, IconoWhatsApp } from './IconosContacto';
import './Footer.css';

// El año se calcula una sola vez al cargar el módulo, no en cada render.
const ANIO = new Date().getFullYear();

const ENLACES_LEGALES = [
  { href: '#privacidad', label: 'Política de privacidad' },
  { href: '#aviso-legal', label: 'Aviso legal' },
  { href: '#cookies', label: 'Cookies' },
];

function IconoFlecha({ arriba = false }: { arriba?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="square"
      aria-hidden="true"
      focusable="false"
      style={arriba ? { transform: 'rotate(-90deg)' } : undefined}
    >
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  );
}

export default function Footer() {
  // Los datos de contacto opcionales solo se muestran si existen en INFO_EMPRESA.
  const { email } = INFO_EMPRESA;
  // El domicilio del titular solo figura en el aviso legal; aquí no se publica
  const lugar = '';
  const hayContacto = Boolean(email || lugar);

  return (
    // .site-footer lo usa index.css para situar el pie en la capa de la página
    <footer className="site-footer ftr">
      {/* Franja CTA */}
      <div className="ftr-cta topo-bg">
        <div className="container ftr-cta-inner">
          <div className="ftr-cta-text">
            <p className="eyebrow">
              <span className="eyebrow-num">07</span>
              <span className="eyebrow-line" aria-hidden="true" />
              Contacto
            </p>
            <h2 className="display-2 ftr-cta-title">Preparamos el terreno para tu proyecto.</h2>
          </div>
          <div className="ftr-cta-actions">
            <a
              href={WHATSAPP_SALUDO_HREF}
              className="btn btn-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconoWhatsApp />
              Escribir por WhatsApp
              <span className="sr-only"> (se abre en una pestaña nueva)</span>
            </a>
            <a href={INFO_EMPRESA.telefonoHref} className="btn btn-outline">
              <IconoTelefono />
              Llamar al {INFO_EMPRESA.telefono}
            </a>
            <a
              href="#contacto"
              className="btn btn-ghost ftr-cta-form"
              onClick={(e) => irASeccion(e, '#contacto')}
            >
              Rellenar el formulario de presupuesto
              <IconoFlecha />
            </a>
          </div>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="ftr-body">
        <div className={`container ftr-grid${hayContacto ? ' ftr-grid--4' : ''}`}>
          <div className="ftr-brand">
            <img
              className="ftr-logo"
              src="/images/logo-fran-sanchez-320.webp"
              srcSet="/images/logo-fran-sanchez-320.webp 320w, /images/logo-fran-sanchez-640.webp 640w"
              sizes="(min-width: 600px) 260px, 240px"
              width="320"
              height="213"
              alt={INFO_EMPRESA.nombreCompleto}
              loading="lazy"
              decoding="async"
            />
            <p className="ftr-lema">{INFO_EMPRESA.lema}</p>
            {ZONA && <p className="ftr-zona">Trabajamos en {ZONA}.</p>}
            <a
              href={INFO_EMPRESA.telefonoHref}
              className="ftr-tel"
            >
              <span className="ftr-tel-label">Teléfono</span>
              <span className="ftr-tel-num">{INFO_EMPRESA.telefono}</span>
            </a>
          </div>

          <div className="ftr-col ftr-col--servicios">
            <h3 className="ftr-col-title">Servicios</h3>
            <ul className="ftr-list">
              {SERVICIOS.map((s) => (
                <li key={s.id}>
                  <a href="#servicios" className="ftr-link" onClick={(e) => irASeccion(e, '#servicios')}>
                    {s.titulo}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav className="ftr-col" aria-label="Navegación del pie">
            <h3 className="ftr-col-title">Navegación</h3>
            <ul className="ftr-list">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="ftr-link" onClick={(e) => irASeccion(e, l.href)}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {hayContacto && (
            <div className="ftr-col">
              <h3 className="ftr-col-title">Contacto</h3>
              <address className="ftr-address">
                {email && (
                  <p>
                    <span className="ftr-address-label">Correo</span>
                    <a href={`mailto:${email}`} className="ftr-link">{email}</a>
                  </p>
                )}
                {lugar && (
                  <p>
                    <span className="ftr-address-label">Dirección</span>
                    {lugar}
                  </p>
                )}
              </address>
            </div>
          )}
        </div>

        {/* Marca de agua tipográfica, recortada por el borde inferior */}
        <div className="ftr-watermark" aria-hidden="true">Fran Sánchez</div>

        <div className="ftr-bottom">
          <div className="container">
            <div className="tech-rule" aria-hidden="true" />
            <div className="ftr-bottom-row">
              <p className="ftr-copy">© {ANIO} {INFO_EMPRESA.nombreCompleto}</p>

              <nav aria-label="Información legal">
                <ul className="ftr-legal">
                  {ENLACES_LEGALES.map((l) => (
                    <li key={l.href}>
                      <a href={l.href} className="ftr-legal-link">{l.label}</a>
                    </li>
                  ))}
                </ul>
              </nav>

              <a href="#inicio" className="ftr-top" onClick={(e) => irASeccion(e, '#inicio')}>
                Volver arriba
                <IconoFlecha arriba />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
