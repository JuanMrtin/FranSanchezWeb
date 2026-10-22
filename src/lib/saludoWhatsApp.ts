import { whatsappHref } from '../data/empresa';

// Enlace de WhatsApp con un saludo corto ya escrito. Lo comparten los botones flotantes
// y la franja de contacto del pie; la persona completa el resto del mensaje en WhatsApp.
const SALUDO = 'Hola, quería pedir información sobre un trabajo.';

export const WHATSAPP_SALUDO_HREF = whatsappHref(SALUDO);
