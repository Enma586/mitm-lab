import { HttpClient } from "./httpClient";

export interface TransferRequest {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
}

export interface TransferResult {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  fromBalance: number;
  toBalance: number;
}

/**
 * Igual que AuthService/ProfileService: interfaz segregada (ISP) que
 * depende de HttpClient, no de fetch directamente (DIP). Reemplaza al
 * `curl -X POST /api/transfer` manual de ejemplo/escenario-transferencias.md:
 * ahora la "victima" dispara la transferencia desde la UI real, con
 * trafico 100% autentico para que Kali intercepte (igual que el login).
 */
export interface TransferService {
  transfer(request: TransferRequest): Promise<TransferResult>;
}

export class HttpTransferService implements TransferService {
  constructor(private readonly httpClient: HttpClient) {}

  transfer(request: TransferRequest): Promise<TransferResult> {
    return this.httpClient.post<TransferResult>("/api/transfer", request);
  }
}
