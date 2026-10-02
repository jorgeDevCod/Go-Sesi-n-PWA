import { prisma } from "@/lib/prisma";

export function findResetTokenByHash(tokenHash: string) {
  return prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });
}

export async function replaceResetTokenForUser(
  userId: string,
  data: { tokenHash: string; expiresAt: Date },
) {
  await prisma.passwordResetToken.deleteMany({ where: { userId } });
  return prisma.passwordResetToken.create({
    data: { userId, tokenHash: data.tokenHash, expiresAt: data.expiresAt },
  });
}

export function markResetTokenUsed(id: string, usedAt: Date) {
  return prisma.passwordResetToken.update({
    where: { id },
    data: { usedAt },
  });
}
