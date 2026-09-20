import { User } from "../entities/User";

/**
 * Puerto de salida (driven port). El dominio declara QUE necesita,
 * no COMO se implementa. La infraestructura provee el adaptador.
 */
export interface UserRepository {
  findByUsername(username: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}
