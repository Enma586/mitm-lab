import { AttackEvent } from "../../domain/entities/AttackEvent";
import { EventStore } from "../../domain/ports/EventStore";

const DEFAULT_LIMIT = 200;

/**
 * Usado por el dashboard al conectarse: trae el historial reciente
 * antes de empezar a recibir eventos nuevos por WebSocket.
 */
export class ListRecentEventsUseCase {
  constructor(private readonly eventStore: EventStore) {}

  execute(limit: number = DEFAULT_LIMIT): Promise<AttackEvent[]> {
    return this.eventStore.listRecent(limit);
  }
}
