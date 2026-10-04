import { Request, Response } from "express";
import { TransferUseCase } from "../../../application/use-cases/TransferUseCase";
import { InvalidTransferError } from "../../../application/errors/InvalidTransferError";

/**
 * Adaptador de entrada (driving adapter): traduce HTTP <-> caso de uso.
 * Igual que AuthController, no contiene reglas de negocio.
 */
export class TransferController {
  constructor(private readonly transferUseCase: TransferUseCase) {}

  transfer = async (req: Request, res: Response): Promise<void> => {
    const { fromAccountId, toAccountId, amount } = req.body ?? {};

    if (typeof fromAccountId !== "string" || typeof toAccountId !== "string") {
      res.status(400).json({ error: "fromAccountId y toAccountId son requeridos" });
      return;
    }

    try {
      const result = await this.transferUseCase.execute({
        fromAccountId,
        toAccountId,
        amount: Number(amount),
      });
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof InvalidTransferError) {
        res.status(400).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };
}
