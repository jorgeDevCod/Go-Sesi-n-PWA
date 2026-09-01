"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  emptyTrash,
  listTrash,
  permanentlyDeleteTrashItems,
  restoreTrashItems,
} from "@/services/categories/trash.service";

export type TrashActionResult = { success: true } | { success: false; error: string };

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

export async function trashListAction(): Promise<
  { success: true; items: Awaited<ReturnType<typeof listTrash>> } | { success: false; error: string }
> {
  try {
    const userId = await requireUserId();
    const items = await listTrash(userId);
    return { success: true, items };
  } catch (error) {
    return toErrorResult(error);
  }
}

export async function trashRestoreAction(
  input: unknown,
): Promise<TrashActionResult> {
  const items = (input as { items?: { kind: "category" | "subcategory"; id: string }[] })?.items ?? [];
  try {
    const userId = await requireUserId();
    await restoreTrashItems(items, userId);
  } catch (error) {
    return toErrorResult(error);
  }
  revalidatePath("/app/trash");
  revalidatePath("/app/subcategories");
  revalidatePath("/app/routine");
  return { success: true };
}

export async function trashEmptyAction(): Promise<TrashActionResult> {
  try {
    const userId = await requireUserId();
    await emptyTrash(userId);
  } catch (error) {
    return toErrorResult(error);
  }
  revalidatePath("/app/trash");
  revalidatePath("/app/subcategories");
  revalidatePath("/app/routine");
  return { success: true };
}

export async function trashPermanentDeleteAction(
  input: unknown,
): Promise<{ success: true; failed: string[] } | { success: false; error: string }> {
  const items = (input as { items?: { kind: "category" | "subcategory"; id: string }[] })?.items ?? [];
  try {
    const userId = await requireUserId();
    const result = await permanentlyDeleteTrashItems(items, userId);
    revalidatePath("/app/trash");
    revalidatePath("/app/subcategories");
    revalidatePath("/app/routine");
    return { success: true, failed: result.failed.map((f) => f.id) };
  } catch (error) {
    return toErrorResult(error);
  }
}
