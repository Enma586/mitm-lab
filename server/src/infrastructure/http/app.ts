import express, { Express } from "express";
import cors from "cors";
import { AuthController } from "./controllers/AuthController";
import { ProfileController } from "./controllers/ProfileController";
import { EventsController } from "./controllers/EventsController";
import { buildRouter } from "./routes/buildRouter";
import { env } from "../config/env";

/**
 * Construye la app de Express (framework/entrega HTTP).
 * Esta es la unica capa que conoce Express; todo lo demas (dominio y
 * aplicacion) es independiente del transporte.
 */
export function createApp(
  authController: AuthController,
  profileController: ProfileController,
  eventsController: EventsController
): Express {
  const app = express();

  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());

  app.use(buildRouter(authController, profileController, eventsController));

  return app;
}
