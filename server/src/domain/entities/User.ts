/**
 * Entidad de dominio. No sabe nada de Express, HTTP ni de como se guarda
 * en un repositorio: es el nucleo de la arquitectura hexagonal.
 */
export interface User {
  id: string;
  username: string;
  passwordHash: string;
  fullName: string;
  email: string;
}
