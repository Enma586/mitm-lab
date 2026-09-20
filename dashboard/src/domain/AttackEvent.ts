/**
 * Espejo del tipo que expone el backend (server/src/domain/entities/AttackEvent.ts).
 * Vive aca porque el dashboard es una app separada; si algun dia esto
 * crece, este archivo es el unico que habria que generar desde un
 * esquema compartido.
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

export interface LabHost {
  ip: string;
  label: string;
  role: "victima" | "servidor" | "atacante";
}

export const LAB_HOSTS: LabHost[] = [
  { ip: "192.168.56.10", label: "Client", role: "victima" },
  { ip: "192.168.56.20", label: "Server", role: "servidor" },
  { ip: "192.168.56.30", label: "Kali", role: "atacante" },
];
