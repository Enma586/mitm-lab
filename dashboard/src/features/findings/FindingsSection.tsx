import { AttackEvent } from "../../domain/AttackEvent";
import { latestFindings } from "../../domain/selectors";
import { Card } from "../../components/ui/Card";
import { EventRow } from "../../components/ui/EventRow";
import "./FindingsSection.css";

interface FindingsSectionProps {
  events: AttackEvent[];
}

const FINDINGS_LIMIT = 30;

/**
 * Version de "Industry Insights": en vez de noticias de mercado, el
 * feed en vivo de lo que realmente se intercepto en esta sesion.
 */
export function FindingsSection({ events }: FindingsSectionProps) {
  const findings = latestFindings(events, FINDINGS_LIMIT);

  return (
    <Card title="Hallazgos en vivo">
      {findings.length === 0 ? (
        <p className="text-dim findings__empty">
          Todavia no se capturo nada. Corre scripts/start-attack.sh en Kali y usa la app desde Client.
        </p>
      ) : (
        <div className="findings__list">
          {findings.map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
        </div>
      )}
    </Card>
  );
}
