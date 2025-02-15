import { authProver } from "@p40/services/prover";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const prover = process.env.PROVER_BASE_URL;

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

        const response = await authProver(
          credentials?.username as string,
          credentials?.password as string
        );

        if (!response.ok) {
          return { error: "Usuário ou senha incorretos." };
        }

        const user = await response.json();

        return user;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.user) {
        session.user = token.user as typeof session.user;
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.user = user;
      }
      return token;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
});
