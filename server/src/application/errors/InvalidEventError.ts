export class InvalidEventError extends Error {
  constructor(message = "Evento invalido") {
    super(message);
    this.name = "InvalidEventError";
  }
}
