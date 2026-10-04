import { Navigate } from "react-router-dom";
import { PageContainer } from "../components/layout/PageContainer";
import { Card } from "../components/ui/Card";
import { ProfileCard } from "../features/profile/ProfileCard";
import { TransferForm } from "../features/transfer/TransferForm";
import { useAuth } from "../context/AuthContext";
import { ProfileService } from "../services/ProfileService";
import { TransferService } from "../services/TransferService";

interface HomePageProps {
  profileService: ProfileService;
  transferService: TransferService;
}

export function HomePage({ profileService, transferService }: HomePageProps) {
  const { isAuthenticated, fullName } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <PageContainer>
      <Card title={`Hola, ${fullName ?? ""}`}>
        <ProfileCard profileService={profileService} />
        <TransferForm transferService={transferService} />
      </Card>
    </PageContainer>
  );
}
