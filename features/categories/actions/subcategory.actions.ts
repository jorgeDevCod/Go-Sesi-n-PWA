"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  createSubcategorySchema,
  deleteSubcategorySchema,
  reorderSubcategoriesSchema,
  updateSubcategorySchema,
} from "@/features/categories/schemas/subcategory.schema";
import { createSubcategoryForUser } from "@/services/categories/create-subcategory.service";
import { updateSubcategoryForUser } from "@/services/categories/update-subcategory.service";
import { deleteSubcategoryForUser } from "@/services/categories/delete-subcategory.service";
import { reorderSubcategoriesForUser } from "@/services/categories/reorder-subcategories.service";

export type ActionResult = { success: true } | { success: false; error: string };

export type CreateSubcategoryActionResult =
  | {
      success: true;
      subcategory: {
        id: string;
        name: string;
        icon: string;
        color: string;
        complexity: string;
        categoryId: string;
      };
    }
  | { success: false; error: string };

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

export async function createSubcategoryAction(
  input: unknown,
): Promise<CreateSubcategoryActionResult> {
  const parsed = createSubcategorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  let created;
  try {
    const userId = await requireUserId();
    created = await createSubcategoryForUser({ userId, ...parsed.data });
  } catch (error) {
    return toErrorResult(error);
  }

  revalidatePath("/app/subcategories");
  revalidatePath("/app/routine");
  return {
    success: true,
    subcategory: {
      id: created.id,
      name: created.name,
      icon: created.icon,
      color: created.color,
      complexity: created.complexity,
      categoryId: created.categoryId,
    },
  };
}

export async function updateSubcategoryAction(input: unknown): Promise<ActionResult> {
  const parsed = updateSubcategorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    const userId = await requireUserId();
    await updateSubcategoryForUser({ userId, ...parsed.data });
  } catch (error) {
    return toErrorResult(error);
  }

  revalidatePath("/app/subcategories");
  revalidatePath("/app/routine");
  return { success: true };
}

export async function deleteSubcategoryAction(input: unknown): Promise<ActionResult> {
  const parsed = deleteSubcategorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    const userId = await requireUserId();
    await deleteSubcategoryForUser(parsed.data.id, userId);
  } catch (error) {
    return toErrorResult(error);
  }

  revalidatePath("/app/subcategories");
  revalidatePath("/app/routine");
  return { success: true };
}

export async function reorderSubcategoriesAction(input: unknown): Promise<ActionResult> {
  const parsed = reorderSubcategoriesSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    const userId = await requireUserId();
    await reorderSubcategoriesForUser({ userId, ...parsed.data });
  } catch (error) {
    return toErrorResult(error);
  }

  revalidatePath("/app/subcategories");
  revalidatePath("/app/routine");
  return { success: true };
}
