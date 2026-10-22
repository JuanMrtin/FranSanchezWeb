import type { CSSProperties, ReactElement } from 'react';
import './pictogramas.css';

// ── Pictogramas de línea fina, estilo plano de ingeniería ────────
// Un dibujo por servicio, en secciones y alzados de obra. Todos los trazos
// llevan pathLength=1 para que el CSS los «dibuje» (stroke-dasharray) sin
// calcular longitudes. El color y la animación se controlan desde
// pictogramas.css; el contenedor que quiera reaccionar al hover/foco debe
// llevar la clase .pg-host.

type Tipo = '' | 'a' | 'f' | 'r'; // normal · acento amarillo · tenue · acento con relleno

const CLASE_TIPO: Record<Tipo, string> = {
  '': 'pg-t',
  a: 'pg-t pg-acc',
  f: 'pg-t pg-faint',
  r: 'pg-t pg-acc pg-fill',
};

/** Devuelve una función que crea trazos numerados (el índice escalona el dibujado). */
function trazador() {
  let n = 0;
  return (d: string, tipo: Tipo = '', extra = '') => {
    const i = n++;
    return (
      <path
        key={i}
        d={d}
        pathLength={1}
        className={extra ? `${CLASE_TIPO[tipo]} ${extra}` : CLASE_TIPO[tipo]}
        style={{ '--i': i } as CSSProperties}
      />
    );
  };
}

const rect = (x: number, y: number, w: number, h: number) => `M${x} ${y}h${w}v${h}h${-w}Z`;
const circ = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;

const origen = (x: number, y: number): CSSProperties => ({ transformOrigin: `${x}px ${y}px` });

function Lienzo({ children }: { children: ReactElement | ReactElement[] }) {
  return (
    <svg
      className="pg"
      viewBox="0 0 120 80"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

// ── 2 · Cimentación: zanja con zapata y pilar en sección ───────
function PCimentacion() {
  const t = trazador();
  return (
    <Lienzo>
      {t('M4 28 H32 V62 H88 V28 H116')}
      {t('M10 34 l-4 6 M20 34 l-4 6 M96 34 l-4 6 M106 34 l-4 6', 'f')}
      {t(rect(42, 50, 36, 12), 'r')}
      <g className="pg-bob">
        {t('M54 50 V18 M66 50 V18 M51 18 H69')}
      </g>
      <g className="pg-pulse">
        {t(circ(48, 56, 1.4))}
        {t(circ(60, 56, 1.4))}
        {t(circ(72, 56, 1.4))}
      </g>
      {t('M32 70 H88 M32 67 V73 M88 67 V73', 'a')}
    </Lienzo>
  );
}

// ── 3 · Piscinas: vaso en sección con lámina de agua ───────────
function PPiscina() {
  const t = trazador();
  return (
    <Lienzo>
      {t('M4 24 H28 M92 24 H116')}
      {t('M28 24 V44 L38 60 H82 L92 44 V24')}
      {t('M28 34 H34 V40 H38', 'f')}
      {t('M10 32 l-4 6 M18 44 l-4 6 M24 56 l-4 6 M96 56 l4 6 M108 36 l4 6 M110 52 l4 6', 'f')}
      <g className="pg-bob">
        {t('M30 36 q5 -3 10 0 t10 0 t10 0 t10 0 t10 0 t10 0', 'a')}
      </g>
      <g className="pg-pulse">
        {t('M102 24 V60 M98 24 H106 M98 60 H106')}
      </g>
    </Lienzo>
  );
}

// ── 5 · Demolición: muro derribado con bola de demolición ──────
function PDemolicion() {
  const t = trazador();
  return (
    <Lienzo>
      {t('M4 66 H116')}
      {t('M10 66 V8 H34')}
      <g className="pg-swing" style={origen(34, 8)}>
        {t('M34 8 V38')}
        {t(circ(34, 44, 6), 'r')}
      </g>
      {t('M60 66 V44 L64 40 L62 34 L67 30 L64 24 H102 V66')}
      {t('M60 56 H102 M64 46 H102 M66 36 H102 M82 66 V56 M72 56 V46 M92 56 V46 M82 46 V36 M76 36 V24 M90 36 V24', 'f')}
      {t(rect(50, 61, 6, 5), 'a')}
      {t(rect(43, 63, 5, 3), 'a')}
      <g className="pg-caida">
        {t(rect(56, 46, 4, 4), 'a')}
      </g>
    </Lienzo>
  );
}

// ── 6 · Limpieza de escombros: contenedor con escombro ─────────
function PEscombros() {
  const t = trazador();
  return (
    <Lienzo>
      {t('M4 66 H116')}
      {t('M20 40 H100 L92 62 H28 Z')}
      {t('M42 40 L44 62 M60 40 V62 M78 40 L76 62', 'f')}
      {t('M30 40 L38 28 L46 33 L54 22 L62 30 L70 20 L78 31 L86 27 L92 40', 'r')}
      <g className="pg-caida">
        {t(rect(56, 6, 8, 7))}
        {t('M60 16 V20', 'f')}
      </g>
    </Lienzo>
  );
}

// ── 7 · Limpieza de solares: parcela con jalones de linde ──────
function PSolar() {
  const t = trazador();
  return (
    <Lienzo>
      {t('M20 26 L96 18 L108 56 L14 62 Z')}
      {t('M20 26 L108 56 M96 18 L14 62', 'f')}
      {t(circ(20, 26, 2.6), 'r', 'pg-jalon')}
      {t(circ(96, 18, 2.6), 'r', 'pg-jalon')}
      {t(circ(108, 56, 2.6), 'r', 'pg-jalon')}
      {t(circ(14, 62, 2.6), 'r', 'pg-jalon')}
      {t('M14 70 L108 64 M14 67 V73 M108 61 V67', 'a')}
      {t('M112 14 V4 M109 8 L112 4 L115 8', 'f')}
    </Lienzo>
  );
}

// ── 8 · Limpieza de tierras: camión volquete con carga ─────────
function PTierras() {
  const t = trazador();
  return (
    <Lienzo>
      {t('M4 70 H116')}
      <g className="pg-bob">
        {t('M8 60 H112')}
        {t('M10 60 V36 H74 V60')}
        {t('M12 36 C20 24 32 20 44 22 C56 21 66 26 72 36', 'r')}
        {t('M78 60 V34 H94 L108 46 V60')}
        {t('M83 39 H93 L102 47 H83 Z', 'f')}
      </g>
      <g className="pg-spin" style={origen(28, 64)}>
        {t(circ(28, 64, 6))}
        {t('M24 64 H32 M28 60 V68', 'f')}
      </g>
      <g className="pg-spin" style={origen(60, 64)}>
        {t(circ(60, 64, 6))}
        {t('M56 64 H64 M60 60 V68', 'f')}
      </g>
      <g className="pg-spin" style={origen(96, 64)}>
        {t(circ(96, 64, 6))}
        {t('M92 64 H100 M96 60 V68', 'f')}
      </g>
    </Lienzo>
  );
}

const PICTOGRAMAS: Record<string, () => ReactElement> = {
  'excavaciones-cimentacion': PCimentacion,
  'excavaciones-piscinas': PPiscina,
  demolicion: PDemolicion,
  'limpieza-escombros': PEscombros,
  'limpieza-solares': PSolar,
  'limpieza-tierras': PTierras,
};

/** Pictograma decorativo del servicio con ese id (no renderiza nada si no existe). */
export function Pictograma({ id }: { id: string }) {
  const Dibujo = PICTOGRAMAS[id];
  return Dibujo ? <Dibujo /> : null;
}
