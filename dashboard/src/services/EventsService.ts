import { AttackEvent } from "../domain/AttackEvent";

/**
 * Puerto: obtener el historial de eventos ya capturados. La unica
 * implementacion real habla HTTP contra el backend; los componentes
 * dependen de esta interfaz, no de fetch (DIP).
 */
export interface EventsService {
  listRecent(): Promise<AttackEvent[]>;
}

export class HttpEventsService implements EventsService {
  constructor(private readonly baseUrl: string) {}

  async listRecent(): Promise<AttackEvent[]> {
    const response = await fetch(`${this.baseUrl}/api/events`);
    if (!response.ok) {
      throw new Error(`No se pudo obtener el historial de eventos (HTTP ${response.status})`);
    }
    const data = (await response.json()) as { events: AttackEvent[] };
    return data.events;
  }
}
