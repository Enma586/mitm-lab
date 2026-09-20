/**
 * Puerto de salida para el hashing de contrasenas.
 * El caso de uso depende de esta interfaz, nunca de una libreria concreta.
 */
export interface PasswordHasher {
  hash(plainPassword: string): string;
  verify(plainPassword: string, hash: string): boolean;
}
