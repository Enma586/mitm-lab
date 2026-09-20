import { ReactNode } from "react";
import "./PageShell.css";

interface PageShellProps {
  children: ReactNode;
}

export function PageShell({ children }: PageShellProps) {
  return <div className="page-shell">{children}</div>;
}
