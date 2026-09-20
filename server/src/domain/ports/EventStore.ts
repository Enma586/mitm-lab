import { AttackEvent } from "../entities/AttackEvent";

/**
 * Puerto de salida para persistir/consultar eventos de ataque.
 */
export interface EventStore {
  append(event: AttackEvent): Promise<void>;
  listRecent(limit: number): Promise<AttackEvent[]>;
}
