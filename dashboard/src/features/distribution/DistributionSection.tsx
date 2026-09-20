import { AttackEvent, AttackEventType } from "../../domain/AttackEvent";
import { countByType } from "../../domain/selectors";
import { Card } from "../../components/ui/Card";
import { BarBlock } from "../../components/ui/BarBlock";
import "./DistributionSection.css";

interface DistributionSectionProps {
  events: AttackEvent[];
}

const TYPE_META: { type: AttackEventType; label: string; color: string }[] = [
  { type: "http-credentials", label: "Credenciales", color: "var(--danger)" },
  { type: "token-replay", label: "Tokens", color: "var(--warning)" },
  { type: "http-request", label: "Peticiones", color: "var(--info)" },
  { type: "attack-started", label: "Sesion", color: "var(--success)" },
];

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
          {TYPE_META.map((meta) => {
            const count = meta.type === "attack-started" ? counts["attack-started"] + counts["attack-stopped"] : counts[meta.type];
            return <BarBlock key={meta.type} label={meta.label} percent={(count / total) * 100} color={meta.color} />;
          })}
        </div>
      </Card>
    </section>
  );
}
