import { findUserByEmail } from "@/repositories/user.repository";
import { verifyPassword } from "@/lib/password";

export async function verifyCredentials(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) return null;

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) return null;

  return user;
}
