import { Request, Response } from "express";
import { IngestAttackEventUseCase } from "../../../application/use-cases/IngestAttackEventUseCase";
import { ListRecentEventsUseCase } from "../../../application/use-cases/ListRecentEventsUseCase";
import { InvalidEventError } from "../../../application/errors/InvalidEventError";

export class EventsController {
  constructor(
    private readonly ingestAttackEvent: IngestAttackEventUseCase,
    private readonly listRecentEvents: ListRecentEventsUseCase
  ) {}

  /**
   * POST /api/events - lo llama scripts/mitm_bridge.py desde Kali cada
   * vez que intercepta algo (login, request, inicio/fin del ataque).
   */
  ingest = async (req: Request, res: Response): Promise<void> => {
    try {
      const event = await this.ingestAttackEvent.execute(req.body ?? {});
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof InvalidEventError) {
        res.status(400).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  /**
   * GET /api/events - lo llama el dashboard al abrir, para pintar el
   * historial de la sesion antes de engancharse al WebSocket en vivo.
   */
  list = async (req: Request, res: Response): Promise<void> => {
    const limit = Number.parseInt(String(req.query.limit ?? "200"), 10);
    const events = await this.listRecentEvents.execute(Number.isFinite(limit) ? limit : undefined);
    res.status(200).json({ events });
  };
}
