import { AttackEvent } from "../entities/AttackEvent";

/**
 * Puerto de salida para difundir un evento en tiempo real
 * (el adaptador de infraestructura decide el transporte: WebSocket,
 * SSE, colas, etc. El dominio y la aplicacion no lo saben).
 */
export interface EventPublisher {
  publish(event: AttackEvent): void;
}
