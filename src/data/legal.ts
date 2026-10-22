// ── Textos legales: privacidad, aviso legal y cookies ─────────────
//
// IMPORTANTE — REVISIÓN LEGAL PENDIENTE
// Este es un texto BASE (RGPD / LOPDGDD / LSSI-CE), redactado para la realidad técnica
// actual de la web. Debe ser revisado por el titular o por su asesor legal ANTES de
// publicar la web. No contiene datos inventados:
//   · Realidad técnica que describen estos textos (si cambia, hay que reescribirlos):
//       - El formulario de contacto NO envía datos a ningún servidor propio ni de terceros
//         contratados: prepara un mensaje que se abre en WhatsApp (Meta Platforms, sujeto a
//         sus propias condiciones y política de privacidad) o la persona llama por teléfono.
//         La web no almacena los datos del formulario.
//       - Sin cookies de analítica, publicidad ni terceros; fuentes alojadas en el propio
//         sitio y ningún recurso de terceros cargado.
//   · Los datos del titular (titular, NIF/CIF, dirección, correo) salen de INFO_EMPRESA
//     (src/data/empresa.ts). Mientras falten, la fila o el dato simplemente no se muestra.
//   · Alojamiento: el texto menciona los registros técnicos habituales del servidor. El
//     titular debe confirmar con su proveedor de alojamiento qué registra y, si procede,
//     nombrarlo en «Datos técnicos de conexión».
//   · Propiedad intelectual: el titular debe confirmar que tiene derechos sobre el logotipo,
//     las ilustraciones y las fotografías publicadas (o la licencia que corresponda).
//   · Si el formulario añade otros canales (correo, SMS, etc.) o campos distintos de los
//     listados en «Datos que se tratan», o si la web empieza a almacenar o enviar datos,
//     hay que ajustar «Cómo funciona el formulario», «Datos que se tratan», «Base jurídica»,
//     «Destinatarios» y «Conservación».
//   · Si se añade analítica, publicidad, mapas, vídeos u otros servicios de terceros que
//     instalen cookies, hay que actualizar «Cookies» y mostrar un aviso de consentimiento.
//
// Sintaxis de texto (la interpreta LegalDialog):
//   {{titularLegal}} {{cif}} {{direccion}} {{email}} {{telefono}} {{nombreCompleto}}
//       → se sustituyen por los datos de INFO_EMPRESA; si no existen, no se muestran.
//   [texto](url)    → enlace; http(s) se abre en pestaña nueva; #hash cambia de documento.
//   **texto**       → negrita.

export type ClaveLegal = 'privacidad' | 'aviso-legal' | 'cookies';

export type BloqueLegal =
  | { tipo: 'p'; texto: string }
  | { tipo: 'ul'; items: string[] }
  /** Pares etiqueta/valor (datos del titular, etc.). */
  | { tipo: 'datos'; filas: Array<{ etiqueta: string; valor: string }> };

export interface SeccionLegal {
  titulo: string;
  bloques: BloqueLegal[];
}

export interface DocumentoLegal {
  titulo: string;
  /** Frase breve bajo el título. */
  resumen: string;
  secciones: SeccionLegal[];
}

const DATOS_TITULAR: BloqueLegal = {
  tipo: 'datos',
  filas: [
    { etiqueta: 'Titular (autónomo)', valor: '{{titularLegal}}' },
    { etiqueta: 'NIF', valor: '{{cif}}' },
    { etiqueta: 'Domicilio', valor: '{{direccion}}' },
    { etiqueta: 'Correo electrónico', valor: '{{email}}' },
    { etiqueta: 'Teléfono', valor: '{{telefono}}' },
  ],
};

export const DOCUMENTOS_LEGALES: Record<ClaveLegal, DocumentoLegal> = {
  // ─────────────────────────────────────────────────────────────
  privacidad: {
    titulo: 'Política de privacidad',
    resumen:
      'Cómo se tratan los datos personales cuando pides un presupuesto o te pones en contacto con nosotros por WhatsApp o por teléfono.',
    secciones: [
      {
        titulo: 'Responsable del tratamiento',
        bloques: [
          {
            tipo: 'p',
            texto:
              'El responsable de los datos personales que se traten a través de los canales de contacto de este sitio web (WhatsApp y teléfono) es:',
          },
          DATOS_TITULAR,
        ],
      },
      {
        titulo: 'Cómo funciona el formulario',
        bloques: [
          {
            tipo: 'p',
            texto:
              'El formulario de contacto de este sitio web **no envía tus datos a ningún servidor**, ni del titular ni de terceros contratados por él, y esta web no almacena lo que escribes en él.',
          },
          {
            tipo: 'p',
            texto:
              'Al usarlo, tu navegador prepara un mensaje con esos datos y abre WhatsApp, en la aplicación o en el navegador, para que lo revises y decidas si lo envías. Si prefieres no usar WhatsApp, puedes llamar por teléfono.',
          },
        ],
      },
      {
        titulo: 'Datos que se tratan',
        bloques: [
          {
            tipo: 'p',
            texto:
              'Solo los datos que tú decidas escribir en el mensaje o comunicar por teléfono. Normalmente son estos:',
          },
          {
            tipo: 'ul',
            items: [
              'Nombre.',
              'Teléfono o correo electrónico de contacto.',
              'Tipo de trabajo que necesitas.',
              'Ubicación aproximada del trabajo.',
              'Descripción del trabajo o mensaje que escribas.',
            ],
          },
          {
            tipo: 'p',
            texto:
              'Si escribes por WhatsApp, el titular recibe además tu número de teléfono y el nombre de perfil que tengas en esa aplicación. Si llamas, recibe tu número de teléfono salvo que lo tengas oculto.',
          },
          {
            tipo: 'p',
            texto:
              'No solicitamos datos especialmente protegidos. Te pedimos que no los incluyas en el mensaje.',
          },
        ],
      },
      {
        titulo: 'Finalidad',
        bloques: [
          {
            tipo: 'p',
            texto:
              'Atender la solicitud de presupuesto o la consulta que decidas enviar por WhatsApp o por teléfono y comunicarnos contigo sobre ella. No se utilizan para elaborar perfiles ni para tomar decisiones automatizadas, y no se emplean para enviarte publicidad.',
          },
        ],
      },
      {
        titulo: 'Base jurídica',
        bloques: [
          {
            tipo: 'p',
            texto:
              'El tratamiento se basa en tu propia iniciativa: eres tú quien decide enviar el mensaje por WhatsApp o llamar por teléfono. Según el caso, lo ampara la aplicación de medidas precontractuales a petición tuya, como preparar un presupuesto (art. 6.1.b del Reglamento (UE) 2016/679, RGPD), o tu consentimiento, que otorgas con ese acto afirmativo y puedes retirar en cualquier momento, sin que ello afecte a la licitud del tratamiento previo (art. 6.1.a).',
          },
        ],
      },
      {
        titulo: 'WhatsApp',
        bloques: [
          {
            tipo: 'p',
            texto:
              'WhatsApp es un servicio de Meta Platforms, ajeno al titular de este sitio web. Cuando envías el mensaje, WhatsApp lo trata conforme a sus propias condiciones y a su política de privacidad, que puedes consultar en [whatsapp.com/legal](https://www.whatsapp.com/legal). El titular no controla ese tratamiento.',
          },
          {
            tipo: 'p',
            texto: 'Usar WhatsApp es opcional: también puedes pedir tu presupuesto llamando por teléfono.',
          },
        ],
      },
      {
        titulo: 'Destinatarios',
        bloques: [
          {
            tipo: 'p',
            texto:
              'Esta web no cede tus datos a nadie: no los recibe ni los almacena. Los datos que lleguen al titular por WhatsApp o por teléfono no se ceden a terceros, salvo obligación legal.',
          },
        ],
      },
      {
        titulo: 'Datos técnicos de conexión',
        bloques: [
          {
            tipo: 'p',
            texto:
              'Como ocurre en cualquier sitio web, el servidor que lo aloja puede registrar de forma automática datos técnicos de la conexión (por ejemplo, la dirección IP y la fecha y hora de la visita) para garantizar el funcionamiento y la seguridad del servicio.',
          },
        ],
      },
      {
        titulo: 'Conservación',
        bloques: [
          {
            tipo: 'p',
            texto:
              'Esta web no conserva los datos del formulario. Los datos que lleguen al titular por WhatsApp o por teléfono se conservarán mientras sean necesarios para atender tu solicitud y, después, durante los plazos exigidos por las obligaciones legales que pudieran derivarse. Transcurridos esos plazos se suprimirán.',
          },
        ],
      },
      {
        titulo: 'Tus derechos',
        bloques: [
          { tipo: 'p', texto: 'Puedes ejercer los siguientes derechos respecto a tus datos personales:' },
          {
            tipo: 'ul',
            items: [
              '**Acceso:** saber qué datos tuyos tratamos.',
              '**Rectificación:** corregir datos inexactos.',
              '**Supresión:** pedir que los eliminemos.',
              '**Oposición:** oponerte a un tratamiento concreto.',
              '**Limitación:** pedir que se restrinja el tratamiento en los casos previstos por la ley.',
              '**Portabilidad:** recibir tus datos en un formato estructurado.',
              '**Retirada del consentimiento:** en cualquier momento, cuando el tratamiento se base en él.',
            ],
          },
          {
            tipo: 'p',
            texto:
              'Para ejercerlos, indica el derecho que deseas ejercer y acompaña una copia de un documento que acredite tu identidad. Puedes hacerlo por WhatsApp o por teléfono, en el {{telefono}}.',
          },
          {
            tipo: 'datos',
            filas: [
              { etiqueta: 'Correo electrónico', valor: '{{email}}' },
              { etiqueta: 'Domicilio', valor: '{{direccion}}' },
            ],
          },
        ],
      },
      {
        titulo: 'Reclamaciones',
        bloques: [
          {
            tipo: 'p',
            texto:
              'Si consideras que el tratamiento de tus datos no es conforme a la normativa, puedes presentar una reclamación ante la Agencia Española de Protección de Datos ([www.aepd.es](https://www.aepd.es)).',
          },
        ],
      },
      {
        titulo: 'Cookies',
        bloques: [
          {
            tipo: 'p',
            texto: 'Consulta cómo tratamos las cookies en la [política de cookies](#cookies).',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  'aviso-legal': {
    titulo: 'Aviso legal',
    resumen: 'Datos del titular de este sitio web y condiciones generales de uso.',
    secciones: [
      {
        titulo: 'Titular del sitio web',
        bloques: [
          {
            tipo: 'p',
            texto:
              'Este sitio web, bajo el nombre comercial **{{nombreCompleto}}**, pertenece a su titular, cuyos datos de contacto son:',
          },
          DATOS_TITULAR,
        ],
      },
      {
        titulo: 'Objeto y condiciones de uso',
        bloques: [
          {
            tipo: 'p',
            texto:
              'Este sitio web tiene carácter informativo: presenta la actividad de la empresa y permite preparar una solicitud de presupuesto que se envía por WhatsApp o por teléfono. El acceso y uso del sitio atribuye la condición de usuario e implica la aceptación de estas condiciones.',
          },
          {
            tipo: 'p',
            texto:
              'El usuario se compromete a hacer un uso lícito del sitio, a no emplearlo para fines contrarios a la ley o a la buena fe, y a no introducir datos falsos o de terceros sin su autorización en el formulario de contacto.',
          },
        ],
      },
      {
        titulo: 'Propiedad intelectual e industrial',
        bloques: [
          {
            tipo: 'p',
            texto:
              'Los textos, el diseño, el código, los logotipos, las imágenes y demás contenidos del sitio pertenecen al titular o se utilizan con la debida autorización. Queda prohibida su reproducción, distribución o transformación sin permiso expreso, salvo lo permitido por la ley.',
          },
        ],
      },
      {
        titulo: 'Responsabilidad',
        bloques: [
          {
            tipo: 'p',
            texto:
              'El titular procura que la información del sitio sea correcta y esté actualizada, pero no garantiza la ausencia de errores ni la disponibilidad ininterrumpida del servicio, y podrá modificar o retirar contenidos sin previo aviso. La información del sitio no constituye una oferta contractual: los trabajos y sus condiciones se concretan en el presupuesto correspondiente.',
          },
          {
            tipo: 'p',
            texto:
              'Este sitio incluye enlaces a servicios de terceros, como WhatsApp, cuyo uso se rige por sus propias condiciones. El titular no controla sus contenidos ni responde de ellos.',
          },
        ],
      },
      {
        titulo: 'Legislación aplicable',
        bloques: [
          {
            tipo: 'p',
            texto:
              'Estas condiciones se rigen por la legislación española. Para cualquier controversia serán competentes los juzgados y tribunales que correspondan conforme a la normativa vigente.',
          },
        ],
      },
      {
        titulo: 'Más información',
        bloques: [
          {
            tipo: 'p',
            texto:
              'Consulta la [política de privacidad](#privacidad) y la [política de cookies](#cookies).',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  cookies: {
    titulo: 'Política de cookies',
    resumen: 'Qué cookies usa este sitio web y cómo puedes controlarlas.',
    secciones: [
      {
        titulo: 'Qué son las cookies',
        bloques: [
          {
            tipo: 'p',
            texto:
              'Las cookies son pequeños archivos que un sitio web guarda en tu dispositivo al visitarlo, por ejemplo para recordar preferencias o medir el uso de la página.',
          },
        ],
      },
      {
        titulo: 'Cookies que usa este sitio',
        bloques: [
          {
            tipo: 'p',
            texto:
              'Este sitio web no utiliza cookies de analítica, de publicidad ni de terceros. Las tipografías se sirven desde el propio sitio y no se carga ningún recurso de terceros, de modo que tu navegador no se conecta a servidores externos para mostrar la página.',
          },
          {
            tipo: 'p',
            texto:
              'Por eso no mostramos un aviso de cookies. Si en el futuro se añade analítica u otros servicios de terceros, actualizaremos esta política y te pediremos tu consentimiento antes de instalar ninguna cookie no necesaria.',
          },
        ],
      },
      {
        titulo: 'Cómo controlar las cookies',
        bloques: [
          {
            tipo: 'p',
            texto:
              'Puedes permitir, bloquear o eliminar las cookies desde la configuración de tu navegador (Chrome, Firefox, Safari, Edge u otros), normalmente en el apartado de privacidad y seguridad.',
          },
        ],
      },
      {
        titulo: 'Enlaces a otros sitios',
        bloques: [
          {
            tipo: 'p',
            texto:
              'Si pulsas el botón de WhatsApp o sigues cualquier otro enlace a una página externa, ese servicio puede usar sus propias cookies, sujetas a su política.',
          },
        ],
      },
      {
        titulo: 'Más información',
        bloques: [
          {
            tipo: 'p',
            texto: 'Consulta cómo tratamos tus datos personales en la [política de privacidad](#privacidad).',
          },
        ],
      },
    ],
  },
};

export function esClaveLegal(valor: string): valor is ClaveLegal {
  return valor === 'privacidad' || valor === 'aviso-legal' || valor === 'cookies';
}
