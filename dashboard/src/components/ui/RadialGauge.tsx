import "./RadialGauge.css";

interface RadialGaugeProps {
  value: number;
  max?: number;
  color: string;
  label: string;
  sublabel: string;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

/**
 * Medidor semicircular hecho a mano con SVG (geometria clasica de
 * gauge, sin ninguna libreria de charts). Usado para el "nivel de
 * exposicion": a diferencia de un puntaje financiero, aca mas alto es
 * peor.
 */
export function RadialGauge({ value, max = 100, color, label, sublabel }: RadialGaugeProps) {
  const fraction = Math.max(0, Math.min(1, value / max));
  const endAngle = -90 + fraction * 180;
  const knob = polarToCartesian(100, 100, 80, endAngle);

  return (
    <div className="radial-gauge">
      <svg viewBox="0 0 200 115" className="radial-gauge__svg">
        <path d={describeArc(100, 100, 80, -90, 90)} className="radial-gauge__track" strokeWidth={14} fill="none" />
        <path
          d={describeArc(100, 100, 80, -90, endAngle)}
          stroke={color}
          strokeWidth={14}
          strokeLinecap="round"
          fill="none"
        />
        <circle cx={knob.x} cy={knob.y} r={7} fill="#fff" stroke={color} strokeWidth={3} />
      </svg>
      <div className="radial-gauge__readout">
        <span className="radial-gauge__value">
          {value}
          <span className="radial-gauge__max">/{max}</span>
        </span>
        <span className="radial-gauge__label">{label}</span>
      </div>
      <p className="radial-gauge__sublabel">{sublabel}</p>
    </div>
  );
}
