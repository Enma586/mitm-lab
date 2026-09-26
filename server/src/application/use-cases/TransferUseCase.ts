import { AccountRepository } from "../../domain/ports/AccountRepository";
import { InvalidTransferError } from "../errors/InvalidTransferError";

export interface TransferInput {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
}

export interface TransferOutput {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  fromBalance: number;
  toBalance: number;
}

/**
 * Caso de uso de aplicacion: mueve saldo entre dos cuentas de prueba.
 * Igual que LoginUseCase, viaja como HTTP plano (sin TLS) para que el
 * ataque MITM de la Fase 5 pueda interceptar tambien este trafico,
 * no solo el login (Fase 7 del roadmap).
 */
export class TransferUseCase {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute(input: TransferInput): Promise<TransferOutput> {
    if (!input.fromAccountId || !input.toAccountId) {
      throw new InvalidTransferError("fromAccountId y toAccountId son requeridos");
    }
    if (input.fromAccountId === input.toAccountId) {
      throw new InvalidTransferError("La cuenta de origen y destino no pueden ser la misma");
    }
    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      throw new InvalidTransferError("amount debe ser un numero mayor a 0");
    }

    const fromAccount = await this.accountRepository.findById(input.fromAccountId);
    if (!fromAccount) {
      throw new InvalidTransferError(`Cuenta de origen desconocida: ${input.fromAccountId}`);
    }
    const toAccount = await this.accountRepository.findById(input.toAccountId);
    if (!toAccount) {
      throw new InvalidTransferError(`Cuenta de destino desconocida: ${input.toAccountId}`);
    }
    if (fromAccount.balance < input.amount) {
      throw new InvalidTransferError("Saldo insuficiente en la cuenta de origen");
    }

    const { from, to } = await this.accountRepository.transfer(
      input.fromAccountId,
      input.toAccountId,
      input.amount
    );

    return {
      fromAccountId: from.id,
      toAccountId: to.id,
      amount: input.amount,
      fromBalance: from.balance,
      toBalance: to.balance,
    };
  }
}
