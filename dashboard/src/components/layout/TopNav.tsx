import { ConnectionStatus } from "../../services/RealtimeEventSource";
import { ConnectionStatusPill } from "../ui/ConnectionStatusPill";
import "./TopNav.css";

interface TopNavProps {
  status: ConnectionStatus;
}

const SECTIONS = [
  { id: "resumen", label: "Resumen" },
  { id: "hosts", label: "Hosts" },
  { id: "distribucion", label: "Distribucion" },
  { id: "hallazgos", label: "Hallazgos" },
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Barra superior: marca + navegacion por secciones (ancla real a cada
 * bloque de la pagina, no son pestanas decorativas) + estado de la
 * conexion en vivo.
 */
export function TopNav({ status }: TopNavProps) {
  return (
    <header className="top-nav">
      <div className="top-nav__brand">
        <span className="top-nav__mark">ML</span>
        MITM Lab
      </div>

      <nav className="top-nav__links">
        {SECTIONS.map((section) => (
          <button key={section.id} type="button" className="top-nav__link" onClick={() => scrollToSection(section.id)}>
            {section.label}
          </button>
        ))}
      </nav>

      <ConnectionStatusPill status={status} />
    </header>
  );
}
