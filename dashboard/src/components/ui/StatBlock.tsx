import "./StatBlock.css";

interface StatBlockProps {
  label: string;
  value: string;
  accentColor: string;
}

/**
 * Mini estadistica con una barra de color a la izquierda, igual patron
 * que "Stocks / Bonds / ETFs / REITs" del mockup. Reutilizable para
 * cualquier conteo por categoria.
 */
export function StatBlock({ label, value, accentColor }: StatBlockProps) {
  return (
    <div className="stat-block">
      <span className="stat-block__bar" style={{ backgroundColor: accentColor }} />
      <div className="stat-block__text">
        <span className="stat-block__label">{label}</span>
        <span className="stat-block__value">{value}</span>
      </div>
    </div>
  );
}
