import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export function createUser(
  data: Pick<Prisma.UserCreateInput, "name" | "email" | "passwordHash">,
  tx: Prisma.TransactionClient = prisma,
) {
  return tx.user.create({ data });
}
