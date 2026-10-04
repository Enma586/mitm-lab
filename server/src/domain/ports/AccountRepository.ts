import { Account } from "../entities/Account";

/**
 * Puerto de salida (driven port). El dominio declara QUE necesita,
 * no COMO se implementa: mover saldo entre dos cuentas de prueba.
 */
export interface AccountRepository {
  findById(id: string): Promise<Account | null>;
  transfer(fromId: string, toId: string, amount: number): Promise<{ from: Account; to: Account }>;
}
