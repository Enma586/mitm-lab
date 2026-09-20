import { Request, Response } from "express";
import { LoginUseCase } from "../../../application/use-cases/LoginUseCase";
import { InvalidCredentialsError } from "../../../application/errors/InvalidCredentialsError";

/**
 * Adaptador de entrada (driving adapter): traduce HTTP <-> caso de uso.
 * No contiene reglas de negocio, solo lee el request y arma el response.
 */
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  login = async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body ?? {};

    if (typeof username !== "string" || typeof password !== "string") {
      res.status(400).json({ error: "username y password son requeridos" });
      return;
    }

    try {
      const result = await this.loginUseCase.execute({ username, password });
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        res.status(401).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };
}
