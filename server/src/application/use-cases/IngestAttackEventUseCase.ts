import { randomUUID } from "node:crypto";
import { AttackEvent, AttackEventType } from "../../domain/entities/AttackEvent";
import { EventStore } from "../../domain/ports/EventStore";
import { EventPublisher } from "../../domain/ports/EventPublisher";
import { InvalidEventError } from "../errors/InvalidEventError";

const VALID_TYPES: AttackEventType[] = [
  "attack-started",
  "attack-stopped",
  "http-credentials",
  "http-request",
  "token-replay",
];

export interface IngestAttackEventInput {
  type: string;
  sourceIp: string;
  targetIp: string;
  summary: string;
  detail?: Record<string, string>;
}

/**
 * Caso de uso que recibe lo que el puente Kali -> Backend manda
 * (scripts/mitm_bridge.py) cada vez que intercepta algo interesante,
 * lo guarda y lo retransmite en vivo a quien este viendo el dashboard.
 */
export class IngestAttackEventUseCase {
  constructor(
    private readonly eventStore: EventStore,
    private readonly eventPublisher: EventPublisher
  ) {}

  async execute(input: IngestAttackEventInput): Promise<AttackEvent> {
    if (!VALID_TYPES.includes(input.type as AttackEventType)) {
      throw new InvalidEventError(`Tipo de evento desconocido: ${input.type}`);
    }
    if (!input.sourceIp || !input.targetIp || !input.summary) {
      throw new InvalidEventError("sourceIp, targetIp y summary son requeridos");
    }

    const event: AttackEvent = {
      id: randomUUID(),
      type: input.type as AttackEventType,
      sourceIp: input.sourceIp,
      targetIp: input.targetIp,
      summary: input.summary,
      detail: input.detail,
      capturedAt: new Date().toISOString(),
    };

    await this.eventStore.append(event);
    this.eventPublisher.publish(event);

    return event;
  }
}
