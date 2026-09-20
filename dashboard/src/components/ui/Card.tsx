import { ReactNode } from "react";
import "./Card.css";

interface CardProps {
  title?: string;
  actions?: ReactNode;
  accent?: boolean;
  children: ReactNode;
}

/**
 * Panel base reutilizable. "accent" activa el fondo degradado naranja
 * que usa la tarjeta principal (trafico interceptado), igual que en el
 * mockup de referencia.
 */
export function Card({ title, actions, accent = false, children }: CardProps) {
  const classes = ["card", accent ? "card--accent" : ""].filter(Boolean).join(" ");
  return (
    <section className={classes}>
      {(title || actions) && (
        <header className="card__header">
          {title && <h2 className="card__title">{title}</h2>}
          {actions && <div className="card__actions">{actions}</div>}
        </header>
      )}
      <div className="card__body">{children}</div>
    </section>
  );
}
