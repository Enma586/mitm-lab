import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { ProfileController } from "../controllers/ProfileController";
import { EventsController } from "../controllers/EventsController";

/**
 * Ensambla las rutas HTTP con los controladores ya construidos.
 * Se recibe todo por parametro (inyeccion de dependencias) para que
 * este archivo no sepa como se crearon los casos de uso ni los adaptadores.
 */
export function buildRouter(
  authController: AuthController,
  profileController: ProfileController,
  eventsController: EventsController
): Router {
  const router = Router();

  router.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  router.post("/api/login", authController.login);
  router.get("/api/profile", profileController.me);

  router.post("/api/events", eventsController.ingest);
  router.get("/api/events", eventsController.list);

  return router;
}
