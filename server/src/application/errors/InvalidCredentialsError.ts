export class InvalidCredentialsError extends Error {
  constructor() {
    super("Usuario o contrasena invalidos");
    this.name = "InvalidCredentialsError";
  }
}
