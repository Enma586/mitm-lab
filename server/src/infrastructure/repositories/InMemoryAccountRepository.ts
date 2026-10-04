import { Account } from "../../domain/entities/Account";
import { AccountRepository } from "../../domain/ports/AccountRepository";
import { InvalidTransferError } from "../../application/errors/InvalidTransferError";

/**
 * Adaptador de salida (driven adapter). Dos cuentas de prueba en
 * memoria para tener trafico de transferencia interesante que
 * interceptar (Fase 7 del roadmap) ademas del login.
 */
export class InMemoryAccountRepository implements AccountRepository {
  private readonly accounts: Account[];

  constructor() {
    this.accounts = [
      { id: "acc-alice", owner: "alice", balance: 1000 },
      { id: "acc-bob", owner: "bob", balance: 500 },
    ];
  }

  async findById(id: string): Promise<Account | null> {
    return this.accounts.find((account) => account.id === id) ?? null;
  }

  async transfer(fromId: string, toId: string, amount: number): Promise<{ from: Account; to: Account }> {
    const from = this.accounts.find((account) => account.id === fromId);
    const to = this.accounts.find((account) => account.id === toId);

    if (!from || !to) {
      throw new InvalidTransferError("Cuenta de origen o destino desconocida");
    }
    if (from.balance < amount) {
      throw new InvalidTransferError("Saldo insuficiente en la cuenta de origen");
    }

    from.balance -= amount;
    to.balance += amount;

    return { from, to };
  }
}
