"use server";

import { auth, signOut } from "@/auth";
import { deleteAccountForUser } from "@/services/account/delete-account.service";

export type DeleteAccountActionResult = { success: true } | { success: false; error: string };

export async function deleteAccountAction(password: unknown): Promise<DeleteAccountActionResult> {
  if (typeof password !== "string" || password.length === 0) {
    return { success: false, error: "Escribe tu contraseña para eliminar tu cuenta." };
  }

  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("No autenticado.");
    }
    await deleteAccountForUser(session.user.id, password);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Ocurrió un error inesperado.",
    };
  }

  // Fuera del try: su throw de redirect debe propagarse a Next, no volverse error.
  await signOut({ redirectTo: "/login" });
  return { success: true };
}
