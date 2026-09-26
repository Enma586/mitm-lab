/**
 * Entidad de dominio: cuenta de prueba usada para el escenario de
 * transferencias (Fase 7 del roadmap). No sabe nada de HTTP ni de
 * como se persiste: solo modela el concepto de "saldo disponible".
 */
export interface Account {
  id: string;
  owner: string;
  balance: number;
}
