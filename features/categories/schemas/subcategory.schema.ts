import { z } from "zod";

const cuid = z.string().cuid("Identificador inválido.");
const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "El color debe ser un hexadecimal válido, ej: #7C3AED.");
const iconKey = z.string().trim().min(1, "Selecciona un icono.");
const name = z
  .string()
  .trim()
  .min(1, "El nombre es obligatorio.")
  .max(40, "El nombre no puede superar 40 caracteres.");
const complexity = z.enum(["LOW", "MEDIUM", "HIGH"]);
const energyLevel = z.enum(["baja", "media", "alta"]).nullish();
const energyComplexity = complexity.nullish();

export const createSubcategorySchema = z.object({
  categoryId: cuid,
  name,
  icon: iconKey,
  color: hexColor,
  complexity: complexity.default("MEDIUM"),
  energyLevel: energyLevel,
  energyComplexity: energyComplexity,
});

export type CreateSubcategoryInput = z.infer<typeof createSubcategorySchema>;

export const updateSubcategorySchema = z
  .object({
    id: cuid,
    name: name.optional(),
    icon: iconKey.optional(),
    color: hexColor.optional(),
    complexity: complexity.optional(),
    energyLevel: energyLevel,
    energyComplexity: energyComplexity,
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.icon !== undefined ||
      data.color !== undefined ||
      data.complexity !== undefined ||
      data.energyLevel !== undefined ||
      data.energyComplexity !== undefined,
    { message: "Debes modificar al menos un campo." },
  );

export type UpdateSubcategoryInput = z.infer<typeof updateSubcategorySchema>;

export const deleteSubcategorySchema = z.object({
  id: cuid,
});

export const reorderSubcategoriesSchema = z.object({
  categoryId: cuid,
  orderedIds: z.array(cuid).min(1, "La lista no puede estar vacía."),
});

export type ReorderSubcategoriesInput = z.infer<typeof reorderSubcategoriesSchema>;
