import "./LineChart.css";

interface LineChartProps {
  values: number[];
  color: string;
  height?: number;
  showArea?: boolean;
}

/**
 * Grafico de linea hecho a mano con SVG (sin recharts/d3/chart.js).
 * Sirve tanto para el grafico grande de trafico como para los mini
 * sparklines de cada host.
 */
export function LineChart({ values, color, height = 160, showArea = true }: LineChartProps) {
  const width = 100;
  const max = Math.max(1, ...values);
  const stepX = values.length > 1 ? width / (values.length - 1) : width;

  const points = values.map((value, index) => {
    const x = index * stepX;
    const y = height - (value / max) * (height - 8) - 4;
    return `${x},${y}`;
  });

  const linePath = `M${points.join(" L")}`;
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  return (
    <svg
      className="line-chart"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{ height }}
    >
      {showArea && <path d={areaPath} fill={color} opacity={0.18} />}
      <path d={linePath} fill="none" stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
