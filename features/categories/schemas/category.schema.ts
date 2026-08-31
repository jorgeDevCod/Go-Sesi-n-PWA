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

export const createCategorySchema = z.object({
  name,
  icon: iconKey,
  color: hexColor,
  complexity: complexity.default("MEDIUM"),
  energyLevel: energyLevel,
  energyComplexity: energyComplexity,
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z
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

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export const deleteCategorySchema = z.object({
  id: cuid,
  password: z.string().optional(),
});

export type DeleteCategoryInput = z.infer<typeof deleteCategorySchema>;
