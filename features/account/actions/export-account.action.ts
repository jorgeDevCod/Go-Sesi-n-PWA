"use server";

import { auth } from "@/auth";
import { exportAccountData } from "@/services/account/export-account.service";

export type ExportAccountActionResult =
  | { success: true; data: Awaited<ReturnType<typeof exportAccountData>> }
  | { success: false; error: string };

export async function exportAccountAction(): Promise<ExportAccountActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("No autenticado.");
    }
    const data = await exportAccountData(session.user.id);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Ocurrió un error inesperado.",
    };
  }
}
