import { AttackEvent } from "../../domain/AttackEvent";
import { isSensitive } from "../../domain/selectors";
import "./EventRow.css";

interface EventRowProps {
  event: AttackEvent;
}

const TYPE_LABEL: Record<AttackEvent["type"], string> = {
  "attack-started": "Inicio de ataque",
  "attack-stopped": "Fin de ataque",
  "http-credentials": "Credenciales interceptadas",
  "http-request": "Peticion HTTP",
  "token-replay": "Token interceptado",
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es", { hour12: false });
}

/**
 * Una fila del feed de hallazgos. Resalta en rojo lo que realmente
 * importa mostrar (credenciales/tokens en texto plano) y deja el resto
 * en gris neutro.
 */
export function EventRow({ event }: EventRowProps) {
  const sensitive = isSensitive(event.type);

  return (
    <div className={`event-row ${sensitive ? "event-row--sensitive" : ""}`}>
      <div className="event-row__marker" />
      <div className="event-row__content">
        <div className="event-row__top">
          <span className="event-row__type">{TYPE_LABEL[event.type]}</span>
          <span className="event-row__time text-dim">{formatTime(event.capturedAt)}</span>
        </div>
        <p className="event-row__summary">{event.summary}</p>
        {event.detail && (
          <p className="event-row__detail mono text-dim">
            {Object.entries(event.detail)
              .map(([key, value]) => `${key}=${value}`)
              .join("  ")}
          </p>
        )}
      </div>
    </div>
  );
}
