export class SessionNotFoundError extends Error {
  constructor() {
    super("La sesión no existe.");
    this.name = "SessionNotFoundError";
  }
}

export class SessionForbiddenError extends Error {
  constructor() {
    super("No tienes permiso sobre esta sesión.");
    this.name = "SessionForbiddenError";
  }
}

export class SubcategoryNotOwnedError extends Error {
  constructor() {
    super("Esa subcategoría no existe o no te pertenece.");
    this.name = "SubcategoryNotOwnedError";
  }
}

export class SessionNotExtendableError extends Error {
  constructor() {
    super("Solo puedes extender una sesión recién terminada.");
    this.name = "SessionNotExtendableError";
  }
}
