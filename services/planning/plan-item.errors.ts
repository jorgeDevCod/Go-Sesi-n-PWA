export class PlanItemNotFoundError extends Error {
  constructor() {
    super("El item de planificación no existe.");
    this.name = "PlanItemNotFoundError";
  }
}

export class PlanItemForbiddenError extends Error {
  constructor() {
    super("No tienes permiso sobre este item de planificación.");
    this.name = "PlanItemForbiddenError";
  }
}
