import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { findUserByEmail } from "@/repositories/user.repository";
import { seedDefaultCategoriesForUser } from "@/services/categories/seed-default-categories";
import { CURRENT_SEED_VERSION } from "@/lib/constants/categories";

export class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super("Ya existe una cuenta con ese correo.");
    this.name = "EmailAlreadyRegisteredError";
  }
}

type RegisterUserInput = {
  name: string;
  email: string;
  password: string;
};

export async function registerUser({ name, email, password }: RegisterUserInput) {
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new EmailAlreadyRegisteredError();
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: { name, email, passwordHash, defaultsSeeded: true, seedVersion: CURRENT_SEED_VERSION },
    });

    await seedDefaultCategoriesForUser(created.id, tx);

    return created;
  });

  return user;
}
