import { createHash } from "node:crypto";
import { PasswordHasher } from "../../domain/ports/PasswordHasher";

/**
 * Implementacion deliberadamente simple (SHA-256 sin salt) para que el
 * laboratorio sea facil de leer y depurar. NO usar en produccion: ahi
 * corresponde bcrypt/argon2 con salt. La vulnerabilidad real que este
 * laboratorio demuestra es el transporte sin TLS, no el hashing.
 */
export class Sha256PasswordHasher implements PasswordHasher {
  hash(plainPassword: string): string {
    return createHash("sha256").update(plainPassword).digest("hex");
  }

  verify(plainPassword: string, hash: string): boolean {
    return this.hash(plainPassword) === hash;
  }
}
