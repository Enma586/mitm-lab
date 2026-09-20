import { Navigate } from "react-router-dom";
import { PageContainer } from "../components/layout/PageContainer";
import { Card } from "../components/ui/Card";
import { ProfileCard } from "../features/profile/ProfileCard";
import { useAuth } from "../context/AuthContext";
import { ProfileService } from "../services/ProfileService";

interface HomePageProps {
  profileService: ProfileService;
}

export function HomePage({ profileService }: HomePageProps) {
  const { isAuthenticated, fullName } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <PageContainer>
      <Card title={`Hola, ${fullName ?? ""}`}>
        <ProfileCard profileService={profileService} />
      </Card>
    </PageContainer>
  );
}
