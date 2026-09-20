import { UserRepository } from "../../domain/ports/UserRepository";
import { TokenService } from "../../domain/ports/TokenService";
import { UnauthorizedError } from "../errors/UnauthorizedError";

export interface ProfileOutput {
  username: string;
  fullName: string;
  email: string;
}

/**
 * Devuelve datos "sensibles" del usuario autenticado.
 * Sirve para tener algo interesante que capturar en la Fase 5: si el
 * atacante roba el token via MITM, puede reusarlo para pedir este perfil.
 */
export class GetProfileUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService
  ) {}

  async execute(token: string): Promise<ProfileOutput> {
    const userId = this.tokenService.verify(token);
    if (!userId) {
      throw new UnauthorizedError();
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError();
    }

    return {
      username: user.username,
      fullName: user.fullName,
      email: user.email,
    };
  }
}
