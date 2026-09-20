import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import { env } from "./infrastructure/config/env";
import { Sha256PasswordHasher } from "./infrastructure/security/Sha256PasswordHasher";
import { InMemoryTokenService } from "./infrastructure/security/InMemoryTokenService";
import { InMemoryUserRepository } from "./infrastructure/repositories/InMemoryUserRepository";
import { InMemoryEventStore } from "./infrastructure/repositories/InMemoryEventStore";
import { WebSocketEventPublisher } from "./infrastructure/realtime/WebSocketEventPublisher";
import { LoginUseCase } from "./application/use-cases/LoginUseCase";
import { GetProfileUseCase } from "./application/use-cases/GetProfileUseCase";
import { IngestAttackEventUseCase } from "./application/use-cases/IngestAttackEventUseCase";
import { ListRecentEventsUseCase } from "./application/use-cases/ListRecentEventsUseCase";
import { AuthController } from "./infrastructure/http/controllers/AuthController";
import { ProfileController } from "./infrastructure/http/controllers/ProfileController";
import { EventsController } from "./infrastructure/http/controllers/EventsController";
import { createApp } from "./infrastructure/http/app";

/**
 * Composition root: el UNICO lugar donde se decide que implementacion
 * concreta usa cada puerto. Cambiar de repositorio en memoria a Postgres,
 * de SHA-256 a bcrypt, o de WebSocket a otro transporte, solo requiere
 * tocar este archivo.
 */
function bootstrap(): void {
  const passwordHasher = new Sha256PasswordHasher();
  const tokenService = new InMemoryTokenService();
  const userRepository = new InMemoryUserRepository(passwordHasher);
  const eventStore = new InMemoryEventStore();

  const loginUseCase = new LoginUseCase(userRepository, passwordHasher, tokenService);
  const getProfileUseCase = new GetProfileUseCase(userRepository, tokenService);
  const listRecentEvents = new ListRecentEventsUseCase(eventStore);

  const authController = new AuthController(loginUseCase);
  const profileController = new ProfileController(getProfileUseCase);

  // El servidor HTTP se crea vacio primero para poder colgar el
  // WebSocketServer del mismo puerto (ruta /ws/events) antes de que
  // exista la app de Express; luego la app se conecta como listener.
  const httpServer = createServer();
  const wss = new WebSocketServer({ server: httpServer, path: "/ws/events" });

  const eventPublisher = new WebSocketEventPublisher(wss);
  const ingestAttackEvent = new IngestAttackEventUseCase(eventStore, eventPublisher);
  const eventsController = new EventsController(ingestAttackEvent, listRecentEvents);

  const app = createApp(authController, profileController, eventsController);
  httpServer.on("request", app);

  httpServer.listen(env.port, () => {
    // Aviso deliberado: este servidor habla HTTP plano, sin TLS.
    // Es el punto exacto que el laboratorio MITM demuestra.
    console.log(`[mitm-server] escuchando en HTTP puerto ${env.port} (sin TLS, a proposito)`);
    console.log(`[mitm-server] WebSocket de eventos en ws://0.0.0.0:${env.port}/ws/events`);
  });
}

bootstrap();
