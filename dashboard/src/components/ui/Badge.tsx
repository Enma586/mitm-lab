import "./Badge.css";

type BadgeVariant = "neutral" | "success" | "warning" | "danger";

interface BadgeProps {
  variant?: BadgeVariant;
  children: string;
}

export function Badge({ variant = "neutral", children }: BadgeProps) {
  return <span className={`badge badge--${variant}`}>{children}</span>;
}
