import { useNavigate } from "react-router-dom";
import { PageContainer } from "../components/layout/PageContainer";
import { Card } from "../components/ui/Card";
import { LoginForm } from "../features/auth/LoginForm";

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <Card title="Laboratorio MITM - Inicio de sesion">
        <LoginForm onSuccess={() => navigate("/home")} />
      </Card>
    </PageContainer>
  );
}
