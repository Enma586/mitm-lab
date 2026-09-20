import { randomUUID } from "node:crypto";
import { TokenService } from "../../domain/ports/TokenService";

/**
 * Adaptador de salida para sesiones. Guarda token -> userId en memoria.
 * Al ser un token opaco enviado por HTTP, tambien queda expuesto a
 * quien intercepte el trafico (ver scripts/start-attack.sh).
 */
export class InMemoryTokenService implements TokenService {
  private readonly tokensByUserId = new Map<string, string>();
  private readonly userIdByToken = new Map<string, string>();

  issue(userId: string): string {
    const existing = this.tokensByUserId.get(userId);
    if (existing) {
      return existing;
    }

    const token = randomUUID();
    this.tokensByUserId.set(userId, token);
    this.userIdByToken.set(token, userId);
    return token;
  }

  verify(token: string): string | null {
    return this.userIdByToken.get(token) ?? null;
  }
}
