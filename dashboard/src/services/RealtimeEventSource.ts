import { AttackEvent } from "../domain/AttackEvent";

export type ConnectionStatus = "connecting" | "open" | "closed";

export interface RealtimeEventHandlers {
  onEvent: (event: AttackEvent) => void;
  onStatusChange: (status: ConnectionStatus) => void;
}

/**
 * Puerto: recibir eventos en vivo. La implementacion concreta usa
 * WebSocket nativo del navegador (sin socket.io ni librerias extra) y
 * se reconecta sola si el backend todavia no esta arriba.
 */
export interface RealtimeEventSource {
  connect(handlers: RealtimeEventHandlers): () => void;
}

const RECONNECT_DELAY_MS = 2000;

export class WebSocketEventSource implements RealtimeEventSource {
  constructor(private readonly url: string) {}

  connect(handlers: RealtimeEventHandlers): () => void {
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let closedByCaller = false;

    const openSocket = () => {
      handlers.onStatusChange("connecting");
      socket = new WebSocket(this.url);

      socket.addEventListener("open", () => {
        handlers.onStatusChange("open");
      });

      socket.addEventListener("message", (message) => {
        try {
          const payload = JSON.parse(message.data as string) as { type: string; event?: AttackEvent };
          if (payload.type === "attack-event" && payload.event) {
            handlers.onEvent(payload.event);
          }
        } catch {
          // Mensaje que no es JSON valido: se ignora, no rompe el dashboard.
        }
      });

      const scheduleReconnect = () => {
        handlers.onStatusChange("closed");
        if (closedByCaller) return;
        reconnectTimer = setTimeout(openSocket, RECONNECT_DELAY_MS);
      };

      socket.addEventListener("close", scheduleReconnect);
      socket.addEventListener("error", () => socket?.close());
    };

    openSocket();

    return () => {
      closedByCaller = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close();
    };
  }
}
