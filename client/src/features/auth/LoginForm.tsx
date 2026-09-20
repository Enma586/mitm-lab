import { FormEvent, useState } from "react";
import { Button } from "../../components/ui/Button";
import { TextField } from "../../components/ui/TextField";
import { AlertBanner } from "../../components/ui/AlertBanner";
import { ApiError } from "../../services/httpClient";
import { useAuth } from "../../context/AuthContext";

interface LoginFormProps {
  onSuccess: () => void;
}

/**
 * Componente de feature: conoce el caso de uso "iniciar sesion" pero
 * delega la llamada real al AuthService a traves de useAuth().
 * La contrasena viaja tal cual al backend por HTTP (ver server/) para
 * que el laboratorio pueda interceptarla en la Fase 5.
 */
export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login } = useAuth();
  const [username, setUsername] = useState("victima");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ username, password });
      onSuccess();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "No se pudo conectar con el servidor";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <AlertBanner variant="warning">
        Esta app viaja por HTTP sin cifrar. Es un laboratorio de seguridad: no uses credenciales reales.
      </AlertBanner>

      <TextField
        id="username"
        label="Usuario"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoComplete="username"
        required
      />
      <TextField
        id="password"
        label="Contrasena"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        required
      />

      {error && <AlertBanner variant="error">{error}</AlertBanner>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Ingresando..." : "Ingresar"}
      </Button>
    </form>
  );
}
