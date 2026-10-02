export class AccountNotFoundError extends Error {
  constructor() {
    super("La cuenta no existe.");
    this.name = "AccountNotFoundError";
  }
}

export class AccountInvalidPasswordError extends Error {
  constructor() {
    super("Contraseña incorrecta.");
    this.name = "AccountInvalidPasswordError";
  }
}
