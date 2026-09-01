"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  createCategorySchema,
  deleteCategorySchema,
  updateCategorySchema,
} from "@/features/categories/schemas/category.schema";
import { createCategoryForUser } from "@/services/categories/create-category.service";
import { updateCategoryForUser } from "@/services/categories/update-category.service";
import { deleteCategoryForUser } from "@/services/categories/delete-category.service";

export type CreateCategoryActionResult =
  | {
      success: true;
      category: {
        id: string;
        key: string | null;
        name: string;
        icon: string;
        color: string;
        complexity: "LOW" | "MEDIUM" | "HIGH";
      };
    }
  | { success: false; error: string };

export type ActionResult = { success: true } | { success: false; error: string };

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autenticado.");
  }
  return session.user.id;
}

function toErrorResult(error: unknown): { success: false; error: string } {
  return {
    success: false,
    error: error instanceof Error ? error.message : "Ocurrió un error inesperado.",
  };
}

export async function createCategoryAction(input: unknown): Promise<CreateCategoryActionResult> {
  const parsed = createCategorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  let created;
  try {
    const userId = await requireUserId();
    created = await createCategoryForUser({ userId, ...parsed.data });
  } catch (error) {
    return toErrorResult(error);
  }

  revalidatePath("/app/subcategories");
  revalidatePath("/app/routine");
  return {
    success: true,
    category: {
      id: created.id,
      key: created.key,
      name: created.name,
      icon: created.icon,
      color: created.color,
      complexity: created.complexity,
    },
  };
}

export async function updateCategoryAction(input: unknown): Promise<ActionResult> {
  const parsed = updateCategorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    const userId = await requireUserId();
    await updateCategoryForUser({ userId, ...parsed.data });
  } catch (error) {
    return toErrorResult(error);
  }

  revalidatePath("/app/subcategories");
  revalidatePath("/app/routine");
  revalidatePath("/app/home");
  return { success: true };
}

export async function deleteCategoryAction(input: unknown): Promise<ActionResult> {
  const parsed = deleteCategorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    const userId = await requireUserId();
    await deleteCategoryForUser(parsed.data.id, userId, parsed.data.password);
  } catch (error) {
    return toErrorResult(error);
  }

  revalidatePath("/app/subcategories");
  revalidatePath("/app/routine");
  revalidatePath("/app/home");
  return { success: true };
}
