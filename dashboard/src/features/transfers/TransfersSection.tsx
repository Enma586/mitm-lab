import { AttackEvent } from "../../domain/AttackEvent";
import { totalTransferred, transferAmountTimeline, transferEvents } from "../../domain/selectors";
import { EVENT_TYPE_META } from "../../domain/eventTypeMeta";
import { Card } from "../../components/ui/Card";
import { StatBlock } from "../../components/ui/StatBlock";
import { LineChart } from "../../components/ui/LineChart";
import { TransferFlowCard } from "./TransferFlowCard";
import "./TransfersSection.css";

interface TransfersSectionProps {
  events: AttackEvent[];
}

const TIMELINE_BUCKETS = 12;

function formatAmount(amount: number): string {
  return `$${amount.toLocaleString("es")}`;
}

/**
 * Fase 7 del roadmap: grafico de transferencias en el tiempo + monto
 * acumulado interceptado. Reusa LineChart y StatBlock igual que
 * OverviewSection, solo que aca la serie es el monto (no el conteo)
 * de POST /api/transfer interceptados por mitm_bridge.py.
 *
 * Ademas del agregado, lista cada transferencia por separado como un
 * diagrama de flujo (TransferFlowCard): el agregado responde "cuanto
 * se intercepto en total", esta lista responde "que transferencias
 * puntuales se vieron" sin tener que leer el JSON crudo de cada una.
 */
export function TransfersSection({ events }: TransfersSectionProps) {
  const transfers = transferEvents(events);
  const total = totalTransferred(events);
  const timeline = transferAmountTimeline(events, TIMELINE_BUCKETS);
  const color = EVENT_TYPE_META["transfer-intercepted"].color;
  const recentFirst = [...transfers].reverse();

  return (
    <section id="transferencias">
      <Card title="Transferencias interceptadas">
        <div className="transfers__grid">
          <div className="transfers__summary">
            <StatBlock label="Transferencias capturadas" value={String(transfers.length)} accentColor={color} />
            <StatBlock label="Monto total capturado" value={formatAmount(total)} accentColor={color} />
          </div>

          <Card accent>
            <div className="transfers__chart-header">
              <div>
                <span>Monto acumulado interceptado</span>
                <h2>{formatAmount(total)}</h2>
              </div>
            </div>
            <LineChart values={timeline} color="#1a0f00" height={160} />
          </Card>
        </div>

        <div className="transfers__flows">
          <h3 className="transfers__flows-title">Detalle por transferencia</h3>
          {recentFirst.length === 0 ? (
            <p className="text-dim">Todavia no se intercepto ninguna transferencia.</p>
          ) : (
            recentFirst.map((event) => <TransferFlowCard key={event.id} event={event} />)
          )}
        </div>
      </Card>
    </section>
  );
}
