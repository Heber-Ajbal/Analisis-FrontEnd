import { environment } from '../../../environments/environment';

const FALLBACK_LOCAL_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1', '0.0.0.0']);

function isLocalHostname(hostname: string): boolean {
  if (!hostname) {
    return true;
  }
  if (LOCAL_HOSTNAMES.has(hostname)) {
    return true;
  }
  return hostname.endsWith('.local');
}

/**
 * Devuelve la clave de reCAPTCHA adecuada según el dominio donde se ejecuta la app.
 * Para dominios locales usa una clave de pruebas para evitar el error "Invalid key type" o restricciones de dominio.
 */
export function resolveRecaptchaSiteKey(): string {
  const configuredKey = environment.recaptchaSiteKey?.trim();
  const localKey = environment.recaptchaSiteKeyLocal?.trim() ?? FALLBACK_LOCAL_KEY;

  if (typeof window === 'undefined') {
    return configuredKey || localKey;
  }

  const hostname = window.location.hostname;
  if (isLocalHostname(hostname)) {
    return localKey || configuredKey || FALLBACK_LOCAL_KEY;
  }

  return configuredKey || FALLBACK_LOCAL_KEY;
}
