export class SubcategoryNotFoundError extends Error {
  constructor() {
    super("La actividad no existe.");
    this.name = "SubcategoryNotFoundError";
  }
}

export class SubcategoryForbiddenError extends Error {
  constructor() {
    super("No tienes permiso sobre esta actividad.");
    this.name = "SubcategoryForbiddenError";
  }
}

export class DuplicateSubcategoryNameError extends Error {
  constructor() {
    super("Ya tienes una actividad con ese nombre en esta categoría.");
    this.name = "DuplicateSubcategoryNameError";
  }
}

export class SubcategoryHasSessionsError extends Error {
  constructor() {
    super(
      "Esta actividad tiene sesiones registradas y no se puede eliminar.",
    );
    this.name = "SubcategoryHasSessionsError";
  }
}
