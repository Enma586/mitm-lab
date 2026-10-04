import { AttackEvent } from "../../domain/AttackEvent";
import { EVENT_TYPE_META } from "../../domain/eventTypeMeta";
import "./TransferFlowCard.css";

interface TransferFlowCardProps {
  event: AttackEvent;
}

function formatAmount(raw: string | undefined): string {
  const amount = Number(raw);
  return Number.isFinite(amount) ? `$${amount.toLocaleString("es")}` : "$?";
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es", { hour12: false });
}

// "acc-alice" -> "AL". Solo para el circulo del diagrama: el id
// completo igual se muestra como etiqueta debajo.
function initials(accountId: string): string {
  const name = accountId.replace(/^acc-/, "");
  return name.slice(0, 2).toUpperCase() || "??";
}

/**
 * Diagrama de flujo de UNA transferencia interceptada: origen -> monto
 * -> destino, dibujado a mano con SVG (mismo enfoque sin librerias que
 * LineChart). Complementa el grafico acumulado de TransfersSection: ese
 * responde "cuanto se intercepto en total", esta tarjeta responde "que
 * paso en esta transferencia puntual" para cada evento transfer-intercepted.
 */
export function TransferFlowCard({ event }: TransferFlowCardProps) {
  const detail = event.detail ?? {};
  const from = detail.fromAccountId ?? "?";
  const to = detail.toAccountId ?? "?";
  const color = EVENT_TYPE_META["transfer-intercepted"].color;

  return (
    <div className="transfer-flow-card">
      <svg
        className="transfer-flow-card__diagram"
        viewBox="0 0 220 72"
        role="img"
        aria-label={`Transferencia de ${from} hacia ${to} por ${formatAmount(detail.amount)}`}
      >
        <line x1="50" y1="26" x2="170" y2="26" stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke" />
        <polygon points="170,21 180,26 170,31" fill={color} />

        <text x="110" y="16" textAnchor="middle" className="transfer-flow-card__amount">
          {formatAmount(detail.amount)}
        </text>

        <circle cx="26" cy="26" r="20" fill="none" stroke={color} strokeWidth={2} />
        <text x="26" y="31" textAnchor="middle" className="transfer-flow-card__initials">
          {initials(from)}
        </text>

        <circle cx="194" cy="26" r="20" fill="none" stroke={color} strokeWidth={2} />
        <text x="194" y="31" textAnchor="middle" className="transfer-flow-card__initials">
          {initials(to)}
        </text>

        <text x="26" y="62" textAnchor="middle" className="transfer-flow-card__label text-dim">
          {from}
        </text>
        <text x="194" y="62" textAnchor="middle" className="transfer-flow-card__label text-dim">
          {to}
        </text>
      </svg>

      <div className="transfer-flow-card__meta">
        <span className="text-dim">{formatTime(event.capturedAt)}</span>
        <span className="mono text-dim">
          saldos resultantes: {from}={detail.fromBalance ?? "?"}  {to}={detail.toBalance ?? "?"}
        </span>
      </div>
    </div>
  );
}
