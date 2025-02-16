import { authProver } from "@p40/services/prover";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: "username" },
        password: { label: "Password", type: "password" },
        zionId: { label: "zionId" },
      },
      authorize: async (credentials) => {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Preencha todos os campos corretamente.");
        }

        try {
          const response = await authProver(
            credentials.username as string,
            credentials.password as string,
            credentials.zionId as string
          );

          if (!response) {
            return null;
          }

          return response;
        } catch (error) {
          throw new Error("Erro interno na autenticação.");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id || "";
        token.name = user.name || null;
        token.email = user.email || null;
        token.role = user.role || "user";
        token.imageUrl = user.imageUrl || null;
        token.phone = user.phone || "";
        token.idProver = user.idProver || "";
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        idProver: (token.idProver as string) || "",
        name: token.name || "",
        email: token.email || "",
        emailVerified: null,
        id: (token.id as string) || "",
        imageUrl: (token.imageUrl as string) || "",
        phone: (token.phone as string) || "",
        role: (token.role as string) || "user",
      };

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
});
