export class CategoryNotFoundError extends Error {
  constructor() {
    super("La categoría no existe.");
    this.name = "CategoryNotFoundError";
  }
}

export class CategoryForbiddenError extends Error {
  constructor() {
    super("No tienes permiso sobre esta categoría.");
    this.name = "CategoryForbiddenError";
  }
}

export class CategoryHasSubcategoriesError extends Error {
  constructor() {
    super("Esta categoría tiene Actividades y no se puede eliminar.");
    this.name = "CategoryHasSubcategoriesError";
  }
}

export class DuplicateCategoryNameError extends Error {
  constructor() {
    super("Ya tienes una categoría con ese nombre.");
    this.name = "DuplicateCategoryNameError";
  }
}

export class PasswordRequiredError extends Error {
  constructor() {
    super("Escribe tu contraseña para eliminar esta categoría.");
    this.name = "PasswordRequiredError";
  }
}

export class InvalidPasswordError extends Error {
  constructor() {
    super("Contraseña incorrecta.");
    this.name = "InvalidPasswordError";
  }
}
