export class InvalidTransferError extends Error {
  constructor(message = "Transferencia invalida") {
    super(message);
    this.name = "InvalidTransferError";
  }
}
