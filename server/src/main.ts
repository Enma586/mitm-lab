import { env } from "./infrastructure/config/env";
import { Sha256PasswordHasher } from "./infrastructure/security/Sha256PasswordHasher";
import { InMemoryTokenService } from "./infrastructure/security/InMemoryTokenService";
import { InMemoryUserRepository } from "./infrastructure/repositories/InMemoryUserRepository";
import { LoginUseCase } from "./application/use-cases/LoginUseCase";
import { GetProfileUseCase } from "./application/use-cases/GetProfileUseCase";
import { AuthController } from "./infrastructure/http/controllers/AuthController";
import { ProfileController } from "./infrastructure/http/controllers/ProfileController";
import { createApp } from "./infrastructure/http/app";

/**
 * Composition root: el UNICO lugar donde se decide que implementacion
 * concreta usa cada puerto. Cambiar de repositorio en memoria a Postgres,
 * o de SHA-256 a bcrypt, solo requiere tocar este archivo.
 */
function bootstrap(): void {
  const passwordHasher = new Sha256PasswordHasher();
  const tokenService = new InMemoryTokenService();
  const userRepository = new InMemoryUserRepository(passwordHasher);

  const loginUseCase = new LoginUseCase(userRepository, passwordHasher, tokenService);
  const getProfileUseCase = new GetProfileUseCase(userRepository, tokenService);

  const authController = new AuthController(loginUseCase);
  const profileController = new ProfileController(getProfileUseCase);

  const app = createApp(authController, profileController);

  app.listen(env.port, () => {
    // Aviso deliberado: este servidor habla HTTP plano, sin TLS.
    // Es el punto exacto que el laboratorio MITM demuestra.
    console.log(`[mitm-server] escuchando en HTTP puerto ${env.port} (sin TLS, a proposito)`);
  });
}

bootstrap();
