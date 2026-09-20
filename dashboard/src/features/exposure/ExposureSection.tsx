import { AttackEvent } from "../../domain/AttackEvent";
import { countByType, exposureScore } from "../../domain/selectors";
import { Card } from "../../components/ui/Card";
import { RadialGauge } from "../../components/ui/RadialGauge";
import "./ExposureSection.css";

interface ExposureSectionProps {
  events: AttackEvent[];
}

function gaugeColor(score: number): string {
  if (score >= 67) return "var(--danger)";
  if (score >= 34) return "var(--warning)";
  return "var(--success)";
}

function sublabel(events: AttackEvent[]): string {
  const counts = countByType(events);
  if (counts["http-credentials"] > 0) {
    return "Credenciales en texto plano detectadas";
  }
  if (counts["token-replay"] > 0) {
    return "Token de sesion reusable detectado";
  }
  if (events.length > 0) {
    return "Solo trafico generico interceptado por ahora";
  }
  return "Todavia no hay trafico interceptado";
}

/**
 * Version de "Risk Score", pero con la semantica invertida: en este
 * laboratorio un numero alto es MALO (mas datos sensibles expuestos),
 * no bueno como en un puntaje de estabilidad financiera.
 */
export function ExposureSection({ events }: ExposureSectionProps) {
  const score = exposureScore(events);

  return (
    <Card title="Nivel de exposicion">
      <RadialGauge value={score} color={gaugeColor(score)} label="exposicion" sublabel={sublabel(events)} />
    </Card>
  );
}
