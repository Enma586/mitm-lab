/**
 * Puerto de infraestructura del lado del cliente: una unica interfaz para
 * hablar por HTTP. Los servicios de mas arriba (AuthService, ProfileService)
 * dependen de esta abstraccion, no de "fetch" directamente (DIP).
 */
export interface HttpClient {
  post<TResponse>(path: string, body: unknown): Promise<TResponse>;
  get<TResponse>(path: string, bearerToken?: string): Promise<TResponse>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class FetchHttpClient implements HttpClient {
  constructor(private readonly baseUrl: string) {}

  async post<TResponse>(path: string, body: unknown): Promise<TResponse> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return this.parse<TResponse>(response);
  }

  async get<TResponse>(path: string, bearerToken?: string): Promise<TResponse> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "GET",
      headers: bearerToken ? { Authorization: `Bearer ${bearerToken}` } : undefined,
    });
    return this.parse<TResponse>(response);
  }

  private async parse<TResponse>(response: Response): Promise<TResponse> {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new ApiError(data?.error ?? "Error de red", response.status);
    }
    return data as TResponse;
  }
}
