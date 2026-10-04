import { AttackEvent, AttackEventType, LAB_HOSTS } from "./AttackEvent";

/**
 * Funciones puras que derivan lo que se ve en el dashboard a partir de
 * la lista cruda de eventos. Separarlas de los componentes las hace
 * faciles de leer y de reusar entre secciones (SRP).
 */

export function countByType(events: AttackEvent[]): Record<AttackEventType, number> {
  const counts: Record<AttackEventType, number> = {
    "attack-started": 0,
    "attack-stopped": 0,
    "http-credentials": 0,
    "http-request": 0,
    "token-replay": 0,
    "transfer-intercepted": 0,
  };
  for (const event of events) {
    counts[event.type] += 1;
  }
  return counts;
}

export interface HostActivity {
  ip: string;
  label: string;
  role: string;
  eventCount: number;
  trend: number[];
}

const TREND_BUCKETS = 12;

export function hostActivity(events: AttackEvent[]): HostActivity[] {
  return LAB_HOSTS.map((host) => {
    const involving = events.filter((event) => event.sourceIp === host.ip || event.targetIp.includes(host.ip));
    return {
      ip: host.ip,
      label: host.label,
      role: host.role,
      eventCount: involving.length,
      trend: bucketCounts(involving, TREND_BUCKETS),
    };
  });
}

/**
 * Reparte los eventos en N baldes segun su orden de llegada (no reloj de
 * pared, para que una rafaga corta de ataque igual dibuje una curva
 * legible) y devuelve el conteo acumulado por balde, para una linea que
 * siempre sube.
 */
export function bucketCounts(events: AttackEvent[], buckets: number): number[] {
  if (events.length === 0) {
    return new Array(buckets).fill(0);
  }

  const perBucket = new Array(buckets).fill(0);
  const step = events.length / buckets;
  events.forEach((_, index) => {
    const bucketIndex = Math.min(buckets - 1, Math.floor(index / step));
    perBucket[bucketIndex] += 1;
  });

  let cumulative = 0;
  return perBucket.map((count) => {
    cumulative += count;
    return cumulative;
  });
}

const EXPOSURE_WEIGHTS: Partial<Record<AttackEventType, number>> = {
  "http-credentials": 40,
  "token-replay": 22,
  "transfer-intercepted": 15,
  "http-request": 2,
};

/**
 * Puntaje 0-100 de "que tan expuesta estuvo la victima". A diferencia
 * de un puntaje financiero, aca mas alto es peor: significa que se
 * interceptaron credenciales o tokens reales en texto plano.
 */
export function exposureScore(events: AttackEvent[]): number {
  const raw = events.reduce((total, event) => total + (EXPOSURE_WEIGHTS[event.type] ?? 0), 0);
  return Math.min(100, Math.round(raw));
}

export function latestFindings(events: AttackEvent[], limit: number): AttackEvent[] {
  return [...events].reverse().slice(0, limit);
}

export function isSensitive(type: AttackEventType): boolean {
  return type === "http-credentials" || type === "token-replay" || type === "transfer-intercepted";
}

function transferAmount(event: AttackEvent): number {
  const amount = Number(event.detail?.amount);
  return Number.isFinite(amount) ? amount : 0;
}

export function transferEvents(events: AttackEvent[]): AttackEvent[] {
  return events.filter((event) => event.type === "transfer-intercepted");
}

/**
 * Monto total interceptado en transferencias, para el StatBlock de
 * "$X capturados en este ataque" (Fase 7 del roadmap).
 */
export function totalTransferred(events: AttackEvent[]): number {
  return transferEvents(events).reduce((total, event) => total + transferAmount(event), 0);
}

/**
 * Igual que bucketCounts, pero acumulando montos en vez de conteos:
 * sirve para dibujar el monto interceptado en el tiempo con el mismo
 * LineChart que ya usa el resto del dashboard.
 */
export function transferAmountTimeline(events: AttackEvent[], buckets: number): number[] {
  const transfers = transferEvents(events);
  if (transfers.length === 0) {
    return new Array(buckets).fill(0);
  }

  const perBucket = new Array(buckets).fill(0);
  const step = transfers.length / buckets;
  transfers.forEach((event, index) => {
    const bucketIndex = Math.min(buckets - 1, Math.floor(index / step));
    perBucket[bucketIndex] += transferAmount(event);
  });

  let cumulative = 0;
  return perBucket.map((amount) => {
    cumulative += amount;
    return cumulative;
  });
}
