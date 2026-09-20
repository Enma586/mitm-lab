import { HttpClient } from "./httpClient";

export interface Credentials {
  username: string;
  password: string;
}

export interface AuthResult {
  token: string;
  username: string;
  fullName: string;
}

/**
 * Interfaz segregada (ISP): solo lo que hace falta para autenticar.
 * Cualquier componente que dependa de "AuthService" no conoce fetch,
 * ni la URL del backend, ni el formato del body.
 */
export interface AuthService {
  login(credentials: Credentials): Promise<AuthResult>;
}

export class HttpAuthService implements AuthService {
  constructor(private readonly httpClient: HttpClient) {}

  login(credentials: Credentials): Promise<AuthResult> {
    return this.httpClient.post<AuthResult>("/api/login", credentials);
  }
}
