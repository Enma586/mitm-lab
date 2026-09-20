/**
 * Entidad de dominio: un evento capturado durante el ataque MITM
 * (login interceptado, peticion HTTP vista pasar, inicio/fin del
 * envenenamiento ARP, etc.). El dominio no sabe que esto vino de
 * mitmproxy ni que se manda por WebSocket: solo modela el concepto.
 */
export type AttackEventType =
  | "attack-started"
  | "attack-stopped"
  | "http-credentials"
  | "http-request"
  | "token-replay";

export interface AttackEvent {
  id: string;
  type: AttackEventType;
  sourceIp: string;
  targetIp: string;
  summary: string;
  detail?: Record<string, string>;
  capturedAt: string;
}
