import "./AlertBanner.css";

type AlertVariant = "error" | "warning";

interface AlertBannerProps {
  variant?: AlertVariant;
  children: string;
}

/**
 * Banner reutilizable para mensajes de error o advertencia.
 * Se usa tanto para errores de login como para el aviso de "esto es HTTP
 * sin cifrar" en el layout general.
 */
export function AlertBanner({ variant = "error", children }: AlertBannerProps) {
  return <div className={`alert-banner alert-banner--${variant}`}>{children}</div>;
}
