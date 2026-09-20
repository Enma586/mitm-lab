import { AttackEvent } from "../../domain/AttackEvent";
import { bucketCounts, countByType } from "../../domain/selectors";
import { Card } from "../../components/ui/Card";
import { StatBlock } from "../../components/ui/StatBlock";
import { LineChart } from "../../components/ui/LineChart";
import { Badge } from "../../components/ui/Badge";
import "./OverviewSection.css";

interface OverviewSectionProps {
  events: AttackEvent[];
  onRefresh: () => void;
}

const TIMELINE_BUCKETS = 24;

/**
 * Version del "Portfolio assets Performance" del mockup, pero para
 * trafico interceptado: total de eventos, desglose por tipo a la
 * izquierda, y la linea acumulada de eventos en el tiempo a la derecha.
 */
export function OverviewSection({ events, onRefresh }: OverviewSectionProps) {
  const counts = countByType(events);
  const credentialShare = events.length > 0 ? Math.round((counts["http-credentials"] / events.length) * 100) : 0;
  const timeline = bucketCounts(events, TIMELINE_BUCKETS);

  return (
    <section id="resumen" className="overview">
      <Card
        title="Trafico interceptado"
        actions={
          <button type="button" className="overview__refresh" onClick={onRefresh}>
            Actualizar
          </button>
        }
      >
        <div className="overview__grid">
          <div className="overview__summary">
            <span className="text-dim">Eventos capturados</span>
            <div className="overview__total">
              <h1>{events.length}</h1>
              {events.length > 0 && <Badge variant="warning">{`${credentialShare}% credenciales`}</Badge>}
            </div>

            <div className="overview__stats">
              <StatBlock label="Credenciales" value={String(counts["http-credentials"])} accentColor="var(--danger)" />
              <StatBlock label="Tokens" value={String(counts["token-replay"])} accentColor="var(--warning)" />
              <StatBlock label="Peticiones HTTP" value={String(counts["http-request"])} accentColor="var(--info)" />
              <StatBlock
                label="Inicio/fin de sesion"
                value={String(counts["attack-started"] + counts["attack-stopped"])}
                accentColor="var(--success)"
              />
            </div>
          </div>

          <Card accent>
            <div className="overview__chart-header">
              <div>
                <span>Trafico capturado</span>
                <h2>{events.length} eventos</h2>
              </div>
            </div>
            <LineChart values={timeline} color="#1a0f00" height={180} />
          </Card>
        </div>
      </Card>
    </section>
  );
}
