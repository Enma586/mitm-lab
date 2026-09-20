import { ReactNode } from "react";
import "./Card.css";

interface CardProps {
  title?: string;
  children: ReactNode;
}

/**
 * Contenedor visual reutilizable, sin logica de negocio.
 */
export function Card({ title, children }: CardProps) {
  return (
    <section className="card">
      {title && <h2 className="card__title">{title}</h2>}
      <div className="card__body">{children}</div>
    </section>
  );
}
