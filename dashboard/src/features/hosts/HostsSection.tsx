import { AttackEvent } from "../../domain/AttackEvent";
import { hostActivity } from "../../domain/selectors";
import { Card } from "../../components/ui/Card";
import { LineChart } from "../../components/ui/LineChart";
import "./HostsSection.css";

interface HostsSectionProps {
  events: AttackEvent[];
}

const ROLE_COLOR: Record<string, string> = {
  victima: "#60a5fa",
  servidor: "#22c55e",
  atacante: "#ef4444",
};

const ROLE_LABEL: Record<string, string> = {
  victima: "Victima",
  servidor: "Servidor",
  atacante: "Atacante",
};

/**
 * Version del "Watchlist" del mockup (AAPL/META/AMZN/MSFT): aca son
 * los 3 hosts del laboratorio, con cuantos eventos involucran a cada
 * uno y una mini tendencia.
 */
export function HostsSection({ events }: HostsSectionProps) {
  const hosts = hostActivity(events);

  return (
    <section id="hosts">
      <Card title="Hosts del laboratorio">
        <div className="hosts-grid">
          {hosts.map((host) => (
            <div key={host.ip} className="host-card">
              <div className="host-card__info">
                <span className="host-card__role" style={{ color: ROLE_COLOR[host.role] }}>
                  {ROLE_LABEL[host.role]}
                </span>
                <span className="host-card__label">{host.label}</span>
                <span className="host-card__ip mono text-dim">{host.ip}</span>
              </div>
              <div className="host-card__chart">
                <LineChart values={host.trend} color={ROLE_COLOR[host.role]} height={48} showArea={false} />
              </div>
              <span className="host-card__count">{host.eventCount}</span>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
