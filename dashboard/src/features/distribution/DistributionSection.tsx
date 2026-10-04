import { AttackEvent, AttackEventType } from "../../domain/AttackEvent";
import { countByType } from "../../domain/selectors";
import { EVENT_TYPE_META } from "../../domain/eventTypeMeta";
import { Card } from "../../components/ui/Card";
import { BarBlock } from "../../components/ui/BarBlock";
import "./DistributionSection.css";

// Etiquetas cortas para el bloque (EVENT_TYPE_META tiene la version
// larga que se usa en el feed de eventos); el color si se comparte.
const SHORT_LABEL: Partial<Record<AttackEventType, string>> = {
  "http-credentials": "Credenciales",
  "token-replay": "Tokens",
  "transfer-intercepted": "Transferencias",
  "http-request": "Peticiones",
  "attack-started": "Sesion",
};

const TYPE_ORDER: AttackEventType[] = [
  "http-credentials",
  "token-replay",
  "transfer-intercepted",
  "http-request",
  "attack-started",
];

interface DistributionSectionProps {
  events: AttackEvent[];
}

/**
 * Version de "Allocation Performance": que porcentaje del trafico
 * interceptado corresponde a cada tipo de evento.
 */
export function DistributionSection({ events }: DistributionSectionProps) {
  const counts = countByType(events);
  const total = Math.max(1, events.length);

  return (
    <section id="distribucion">
      <Card title="Distribucion por tipo de evento">
        <div className="distribution-grid">
          {TYPE_ORDER.map((type) => {
            const meta = EVENT_TYPE_META[type];
            const count = type === "attack-started" ? counts["attack-started"] + counts["attack-stopped"] : counts[type];
            return <BarBlock key={type} label={SHORT_LABEL[type] ?? meta.label} percent={(count / total) * 100} color={meta.color} />;
          })}
        </div>
      </Card>
    </section>
  );
}
