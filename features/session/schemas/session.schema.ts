import { z } from "zod";
import { MAX_MINUTES, MIN_MINUTES } from "@/lib/duration-parser";

const cuid = z.string().cuid("Identificador inválido.");
const minutes = z.number().int().min(MIN_MINUTES).max(MAX_MINUTES);

export const pomodoroConfigSchema = z.object({
  focusMin: z.number().int().min(5).max(180),
  breakMin: z.number().int().min(1).max(60),
  cycles: z.number().int().min(1).max(12),
  autoStart: z.boolean(),
});

export const startSessionSchema = z
  .object({
    subcategoryId: cuid,
    plannedMinutes: minutes,
    mode: z.enum(["CLASSIC", "POMODORO"]).default("CLASSIC"),
    pomodoroConfig: pomodoroConfigSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.mode === "POMODORO" && !data.pomodoroConfig) {
      ctx.addIssue({
        code: "custom",
        message: "El modo pomodoro requiere configuración.",
      });
    }
  });
export type StartSessionInput = z.infer<typeof startSessionSchema>;

export const sessionIdSchema = z.object({
  id: cuid,
});

export const extendSessionSchema = z.object({
  id: cuid,
  extraMinutes: minutes,
});
export type ExtendSessionInput = z.infer<typeof extendSessionSchema>;
