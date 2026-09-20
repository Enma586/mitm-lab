import { ButtonHTMLAttributes } from "react";
import "./Button.css";

type ButtonVariant = "primary" | "secondary";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

/**
 * Componente puro y reutilizable: no sabe nada de login, perfiles ni
 * llamadas HTTP. Se usa en cualquier parte de la app que necesite un boton.
 */
export function Button({ variant = "primary", className, ...rest }: ButtonProps) {
  const classes = ["btn", `btn--${variant}`, className].filter(Boolean).join(" ");
  return <button className={classes} {...rest} />;
}
