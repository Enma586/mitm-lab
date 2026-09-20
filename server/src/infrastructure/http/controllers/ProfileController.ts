import { Request, Response } from "express";
import { GetProfileUseCase } from "../../../application/use-cases/GetProfileUseCase";
import { UnauthorizedError } from "../../../application/errors/UnauthorizedError";

export class ProfileController {
  constructor(private readonly getProfileUseCase: GetProfileUseCase) {}

  me = async (req: Request, res: Response): Promise<void> => {
    const authHeader = req.header("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";

    if (!token) {
      res.status(401).json({ error: "Falta el header Authorization: Bearer <token>" });
      return;
    }

    try {
      const profile = await this.getProfileUseCase.execute(token);
      res.status(200).json(profile);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        res.status(401).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };
}
