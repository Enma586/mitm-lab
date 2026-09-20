import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { AuthService, Credentials } from "../services/AuthService";

interface AuthState {
  token: string | null;
  username: string | null;
  fullName: string | null;
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  authService: AuthService;
  children: ReactNode;
}

/**
 * El Provider recibe "authService" ya construido desde fuera (App.tsx,
 * el composition root del front). Este componente no sabe si por debajo
 * hay fetch, axios o un mock de pruebas: solo conoce la interfaz (DIP).
 */
export function AuthProvider({ authService, children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({ token: null, username: null, fullName: null });

  const login = useCallback(
    async (credentials: Credentials) => {
      const result = await authService.login(credentials);
      setState({ token: result.token, username: result.username, fullName: result.fullName });
    },
    [authService]
  );

  const logout = useCallback(() => {
    setState({ token: null, username: null, fullName: null });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, isAuthenticated: state.token !== null, login, logout }),
    [state, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
