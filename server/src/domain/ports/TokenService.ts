/**
 * Puerto de salida para emitir/verificar el token de sesion.
 */
export interface TokenService {
  issue(userId: string): string;
  verify(token: string): string | null;
}
