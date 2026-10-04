import { AttackEvent } from "../../domain/AttackEvent";
import { isSensitive } from "../../domain/selectors";
import { EVENT_TYPE_META } from "../../domain/eventTypeMeta";
import "./EventRow.css";

interface EventRowProps {
  event: AttackEvent;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es", { hour12: false });
}

/**
 * Una fila del feed de hallazgos. El marcador de la izquierda usa el
 * color propio de cada tipo de evento (EVENT_TYPE_META) para que se
 * distingan a simple vista en vez de verse todos iguales, y ademas
 * resalta con fondo tenue lo que realmente importa (credenciales,
 * tokens, transferencias en texto plano).
 */
export function EventRow({ event }: EventRowProps) {
  const sensitive = isSensitive(event.type);
  const meta = EVENT_TYPE_META[event.type];

  return (
    <div className={`event-row ${sensitive ? "event-row--sensitive" : ""}`}>
      <div className="event-row__marker" style={{ backgroundColor: meta.color }} />
      <div className="event-row__content">
        <div className="event-row__top">
          <span className="event-row__type">{meta.label}</span>
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
