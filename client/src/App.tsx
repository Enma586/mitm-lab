import { BrowserRouter, Route, Routes } from "react-router-dom";
import { FetchHttpClient } from "./services/httpClient";
import { HttpAuthService } from "./services/AuthService";
import { HttpProfileService } from "./services/ProfileService";
import { HttpTransferService } from "./services/TransferService";
import { AuthProvider } from "./context/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { HomePage } from "./pages/HomePage";
import { env } from "./config/env";

/**
 * Composition root del frontend: aqui, y solo aqui, se decide con que
 * implementaciones concretas trabaja la app (Dependency Inversion).
 * Cambiar de backend HTTP a un mock de pruebas solo requiere tocar
 * estas 3 lineas.
 */
const httpClient = new FetchHttpClient(env.apiBaseUrl);
const authService = new HttpAuthService(httpClient);
const profileService = new HttpProfileService(httpClient);
const transferService = new HttpTransferService(httpClient);

export function App() {
  return (
    <AuthProvider authService={authService}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/home"
            element={<HomePage profileService={profileService} transferService={transferService} />}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
