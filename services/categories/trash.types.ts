/** Máximo de artículos que guarda la papelera. */
export const TRASH_MAX_ITEMS = 50;
/** Días que se conservan los artículos eliminados antes de purgarse. */
export const TRASH_RETENTION_DAYS = 15;

export type TrashItem =
  | {
      kind: "category";
      id: string;
      name: string;
      icon: string;
      color: string;
      deletedAt: Date;
    }
  | {
      kind: "subcategory";
      id: string;
      name: string;
      icon: string;
      color: string;
      deletedAt: Date;
      categoryName: string;
    };
