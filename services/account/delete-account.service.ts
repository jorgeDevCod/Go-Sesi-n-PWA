import { deleteUser, findUserById } from "@/repositories/user.repository";
import { verifyPassword } from "@/lib/password";
import { AccountInvalidPasswordError, AccountNotFoundError } from "./account.errors";

/**
 * Elimina la cuenta del usuario tras verificar su contraseña.
 * Todo el contenido se borra en cascada (categorías, actividades,
 * sesiones, planes): no hay vuelta atrás.
 */
export async function deleteAccountForUser(userId: string, password: string) {
  const user = await findUserById(userId);
  if (!user) throw new AccountNotFoundError();
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) throw new AccountInvalidPasswordError();
  return deleteUser(userId);
}
