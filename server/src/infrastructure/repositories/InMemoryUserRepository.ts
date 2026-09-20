import { randomUUID } from "node:crypto";
import { User } from "../../domain/entities/User";
import { UserRepository } from "../../domain/ports/UserRepository";
import { PasswordHasher } from "../../domain/ports/PasswordHasher";

/**
 * Adaptador de salida (driven adapter). Implementa el puerto UserRepository
 * usando un arreglo en memoria: suficiente para el laboratorio, y facil de
 * cambiar por Postgres/Mongo/etc. sin tocar el dominio ni los casos de uso.
 */
export class InMemoryUserRepository implements UserRepository {
  private readonly users: User[];

  constructor(passwordHasher: PasswordHasher) {
    // Usuario de demo para la Fase 5 del roadmap: la "victima" inicia
    // sesion con estas credenciales y Kali las intercepta en texto plano.
    this.users = [
      {
        id: randomUUID(),
        username: "victima",
        passwordHash: passwordHasher.hash("password123"),
        fullName: "Usuario de Prueba",
        email: "victima@mitm-lab.local",
      },
    ];
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.users.find((user) => user.username === username) ?? null;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) ?? null;
  }
}
