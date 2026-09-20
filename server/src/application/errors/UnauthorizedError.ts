export class UnauthorizedError extends Error {
  constructor(message = "Token invalido o expirado") {
    super(message);
    this.name = "UnauthorizedError";
  }
}
