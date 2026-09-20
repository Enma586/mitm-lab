import { AttackEvent } from "../../domain/entities/AttackEvent";
import { EventStore } from "../../domain/ports/EventStore";

const MAX_EVENTS = 500;

/**
 * Ring buffer en memoria. Suficiente para una sesion de laboratorio;
 * cambiar a Redis/Postgres solo requiere otra clase que implemente
 * EventStore, sin tocar los casos de uso.
 */
export class InMemoryEventStore implements EventStore {
  private readonly events: AttackEvent[] = [];

  async append(event: AttackEvent): Promise<void> {
    this.events.push(event);
    if (this.events.length > MAX_EVENTS) {
      this.events.shift();
    }
  }

  async listRecent(limit: number): Promise<AttackEvent[]> {
    return this.events.slice(-limit);
  }
}
