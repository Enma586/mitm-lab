import { ReactNode } from "react";
import "./PageContainer.css";

interface PageContainerProps {
  children: ReactNode;
}

/**
 * Layout de pagina completa, centra el contenido. Reutilizable por
 * LoginPage, HomePage y cualquier pagina futura.
 */
export function PageContainer({ children }: PageContainerProps) {
  return <main className="page-container">{children}</main>;
}
