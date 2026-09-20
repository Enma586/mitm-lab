import { PageShell } from "./components/layout/PageShell";
import { OverviewSection } from "./features/overview/OverviewSection";
import { HostsSection } from "./features/hosts/HostsSection";
import { DistributionSection } from "./features/distribution/DistributionSection";
import { ExposureSection } from "./features/exposure/ExposureSection";
import { FindingsSection } from "./features/findings/FindingsSection";
import { useAttackEvents } from "./hooks/useAttackEvents";
import { HttpEventsService } from "./services/EventsService";
import { WebSocketEventSource } from "./services/RealtimeEventSource";
import { env } from "./config/env";
import "./App.css";

/**
 * Composition root del dashboard: aca se decide que implementaciones
 * concretas usan los puertos (HttpEventsService, WebSocketEventSource).
 * Cambiar el transporte o el backend solo requiere tocar este archivo.
 */
const eventsService = new HttpEventsService(env.apiBaseUrl);
const realtimeSource = new WebSocketEventSource(env.wsUrl);

export function App() {
  const { events, refetch } = useAttackEvents(eventsService, realtimeSource);

  return (
    <PageShell>
      <OverviewSection events={events} onRefresh={refetch} />
      <HostsSection events={events} />
      <DistributionSection events={events} />
      <section id="hallazgos" className="bottom-row">
        <ExposureSection events={events} />
        <FindingsSection events={events} />
      </section>
    </PageShell>
  );
}
