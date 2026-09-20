import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { AlertBanner } from "../../components/ui/AlertBanner";
import { ApiError } from "../../services/httpClient";
import { Profile, ProfileService } from "../../services/ProfileService";
import { useAuth } from "../../context/AuthContext";

interface ProfileCardProps {
  profileService: ProfileService;
}

/**
 * Pide el perfil "sensible" del usuario autenticado usando el token
 * guardado en el AuthContext. Ese token tambien viaja por HTTP plano,
 * asi que si Kali lo capturo puede reutilizarlo para pedir este mismo
 * endpoint (ver ansible/kali.yml y scripts/start-attack.sh).
 */
export function ProfileCard({ profileService }: ProfileCardProps) {
  const { token, logout } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    profileService
      .getProfile(token)
      .then((result) => {
        if (isMounted) setProfile(result);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof ApiError ? err.message : "No se pudo cargar el perfil");
      });

    return () => {
      isMounted = false;
    };
  }, [token, profileService]);

  if (error) {
    return <AlertBanner variant="error">{error}</AlertBanner>;
  }

  if (!profile) {
    return <p>Cargando perfil...</p>;
  }

  return (
    <div className="profile-card">
      <p>
        <strong>Usuario:</strong> {profile.username}
      </p>
      <p>
        <strong>Nombre:</strong> {profile.fullName}
      </p>
      <p>
        <strong>Email:</strong> {profile.email}
      </p>
      <Button variant="secondary" onClick={logout}>
        Cerrar sesion
      </Button>
    </div>
  );
}
