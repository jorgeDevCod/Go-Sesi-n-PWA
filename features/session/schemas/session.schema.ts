import { z } from "zod";
import { MAX_MINUTES, MIN_MINUTES } from "@/lib/duration-parser";

const cuid = z.string().cuid("Identificador inválido.");
const minutes = z.number().int().min(MIN_MINUTES).max(MAX_MINUTES);

export const startSessionSchema = z.object({
  subcategoryId: cuid,
  plannedMinutes: minutes,
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
