import "./BarBlock.css";

interface BarBlockProps {
  label: string;
  percent: number;
  color: string;
}

/**
 * Bloque de altura proporcional al porcentaje, igual patron que
 * "Allocation Performance" del mockup (Bonds/Stocks/ETFs/Crypto).
 */
export function BarBlock({ label, percent, color }: BarBlockProps) {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div className="bar-block">
      <div className="bar-block__track">
        <div className="bar-block__fill" style={{ height: `${clamped}%`, backgroundColor: color }}>
          {clamped > 0 && <span className="bar-block__percent">{Math.round(clamped)}%</span>}
        </div>
      </div>
      <span className="bar-block__label">{label}</span>
    </div>
  );
}
