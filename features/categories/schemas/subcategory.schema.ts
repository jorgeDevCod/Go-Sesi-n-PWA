import { z } from "zod";
import { MAX_MINUTES, MIN_MINUTES } from "@/lib/duration-parser";

const cuid = z.string().cuid("Identificador inválido.");
const minutes = z.number().int().min(MIN_MINUTES).max(MAX_MINUTES);
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

/** Cronómetro pomodoro de una actividad (repeticiones, descanso y foco). */
export const activityPomodoroSchema = z.object({
  focusMin: z.number().int().min(5).max(180),
  breakMin: z.number().int().min(0).max(60),
  cycles: z.number().int().min(1).max(12),
  autoStart: z.boolean(),
  longBreakMin: z.number().int().min(0).max(90).optional(),
  skipBreaks: z.boolean().optional(),
});

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
    pomodoroConfig: activityPomodoroSchema.nullable().optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.icon !== undefined ||
      data.color !== undefined ||
      data.complexity !== undefined ||
      data.energyLevel !== undefined ||
      data.energyComplexity !== undefined ||
      data.pomodoroConfig !== undefined,
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

export const setActivityPomodoroSchema = z.object({
  id: cuid,
  pomodoroConfig: activityPomodoroSchema.nullable(),
});

export type SetActivityPomodoroInput = z.infer<typeof setActivityPomodoroSchema>;

/** Último ajuste de tiempo de una actividad antes de iniciar. */
export const saveActivityTimerPreferenceSchema = z
  .object({
    id: cuid,
    mode: z.enum(["CLASSIC", "POMODORO"]),
    classicMinutes: minutes.optional(),
    pomodoroConfig: activityPomodoroSchema.nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.mode === "CLASSIC" && data.classicMinutes === undefined) {
      ctx.addIssue({
        code: "custom",
        message: "El modo clásico requiere minutos.",
      });
    }
    if (data.mode === "POMODORO" && !data.pomodoroConfig) {
      ctx.addIssue({
        code: "custom",
        message: "El modo pomodoro requiere configuración.",
      });
    }
  });

export type SaveActivityTimerPreferenceInput = z.infer<
  typeof saveActivityTimerPreferenceSchema
>;
