import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { loginSchema } from "@/features/auth/schemas/auth.schema";
import { verifyCredentials } from "@/services/auth/get-user-by-email.service";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      authorize: async (rawCredentials) => {
        const parsed = loginSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const user = await verifyCredentials(
          parsed.data.email,
          parsed.data.password,
        );
        if (!user) return null;

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
});
