import { ConnectionStatus } from "../../services/RealtimeEventSource";
import "./ConnectionStatusPill.css";

interface ConnectionStatusPillProps {
  status: ConnectionStatus;
}

const LABEL: Record<ConnectionStatus, string> = {
  open: "En vivo",
  connecting: "Conectando",
  closed: "Sin conexion",
};

export function ConnectionStatusPill({ status }: ConnectionStatusPillProps) {
  return (
    <span className={`connection-pill connection-pill--${status}`}>
      <span className="connection-pill__dot" />
      {LABEL[status]}
    </span>
  );
}
