import { authProver } from "@p40/services/prover";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: "username" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Preencha todos os campos corretamente.");
        }

        try {
          const response = await authProver(
            credentials.username as string,
            credentials.password as string
          );

          if (!response || response.error) {
            return null;
          }

          return {
            id: response.user.id || null,
            name: response.user.nome || null,
            email: response.user.login || null,
            role: response.user.type || "user",
          };
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
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        name: token.name,
        email: token.email,
        address: null,
        emailVerified: null,
        id: token.id as string,
        image: null,
      };
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
