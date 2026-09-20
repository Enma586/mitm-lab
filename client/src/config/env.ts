/**
 * Configuracion del cliente. La URL del backend apunta al server por HTTP
 * plano (sin TLS): es justo el trafico que el laboratorio quiere exponer.
 */
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://192.168.56.20:4000",
};
