import { UserRepository } from "../../domain/ports/UserRepository";
import { PasswordHasher } from "../../domain/ports/PasswordHasher";
import { TokenService } from "../../domain/ports/TokenService";
import { InvalidCredentialsError } from "../errors/InvalidCredentialsError";

export interface LoginInput {
  username: string;
  password: string;
}

export interface LoginOutput {
  token: string;
  username: string;
  fullName: string;
}

/**
 * Caso de uso de aplicacion: orquesta los puertos de dominio.
 * No conoce Express ni el transporte HTTP: se le podria llamar desde
 * un CLI o desde otro protocolo sin cambiar una linea de esta clase.
 *
 * Nota de seguridad (a proposito, para el laboratorio):
 * este caso de uso recibe la contrasena en texto plano tal como llega
 * de la capa HTTP. El servidor la compara contra un hash guardado,
 * pero el viaje "cliente -> servidor" ocurre sobre HTTP sin TLS,
 * por eso arpspoof + Wireshark pueden leerla en la Fase 5 del roadmap.
 */
export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const user = await this.userRepository.findByUsername(input.username);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const isPasswordValid = this.passwordHasher.verify(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    const token = this.tokenService.issue(user.id);

    return {
      token,
      username: user.username,
      fullName: user.fullName,
    };
  }
}
