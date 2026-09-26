import { AttackEventType } from "./AttackEvent";

export interface EventTypeMeta {
  label: string;
  color: string;
}

/**
 * Punto unico de verdad para "como se ve cada tipo de evento":
 * etiqueta legible + color de acento. Antes EventRow y
 * DistributionSection tenian cada uno su propia copia (Fase 7 del
 * roadmap: "distinguir visualmente por tipo de evento en la lista").
 */
export const EVENT_TYPE_META: Record<AttackEventType, EventTypeMeta> = {
  "attack-started": { label: "Inicio de ataque", color: "var(--success)" },
  "attack-stopped": { label: "Fin de ataque", color: "var(--success)" },
  "http-credentials": { label: "Credenciales interceptadas", color: "var(--danger)" },
  "http-request": { label: "Peticion HTTP", color: "var(--info)" },
  "token-replay": { label: "Token interceptado", color: "var(--warning)" },
  "transfer-intercepted": { label: "Transferencia interceptada", color: "var(--accent-solid)" },
};
