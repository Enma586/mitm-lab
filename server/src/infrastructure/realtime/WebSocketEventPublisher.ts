import { WebSocketServer } from "ws";
import { AttackEvent } from "../../domain/entities/AttackEvent";
import { EventPublisher } from "../../domain/ports/EventPublisher";

/**
 * Adaptador de salida: implementa EventPublisher usando WebSockets.
 * El dashboard se conecta a esta misma instancia (via /ws/events) y
 * recibe cada evento apenas se publica, sin hacer polling.
 */
export class WebSocketEventPublisher implements EventPublisher {
  constructor(private readonly wss: WebSocketServer) {}

  publish(event: AttackEvent): void {
    const payload = JSON.stringify({ type: "attack-event", event });

    for (const client of this.wss.clients) {
      if (client.readyState === client.OPEN) {
        client.send(payload);
      }
    }
  }
}
