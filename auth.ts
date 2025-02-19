import api from "@p40/lib/axios";
import Log from "@p40/services/logging";
import { authProver } from "@p40/services/prover";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: "username" },
        password: { label: "Password", type: "password" },
        zionId: { label: "zionId" },
      },
      authorize: async (credentials) => {
        if (
          !credentials?.username ||
          !credentials?.password ||
          !credentials?.zionId
        ) {
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
          Log(error);
          throw new Error("Erro interno na autenticação.");
        }
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },

      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          imageUrl: profile.picture,
          churchId: null,
          idProver: null,
          role: null,
          whatsapp: null,
          image: null,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // 📌 Chama a API para obter os dados atualizados do usuário
          const { data: newUser } = await api.post("/api/auth/migrar/google", {
            id: profile.sub,
            name: profile.name,
            email: profile.email,
            imageUrl: profile.picture ?? profile.imageUrl,
          });

          console.log("🔹 Usuário atualizado no backend:", newUser);

          // 📌 **Salva os dados atualizados dentro do `user`**
          user.id = newUser.user.id;
          user.idProver = newUser.user.idProver;
          user.name = newUser.user.name;
          user.email = newUser.user.email;
          user.imageUrl = newUser.user.imageUrl;
          user.whatsapp = newUser.user.whatsapp;
          user.role = newUser.user.role;
          user.churchId = newUser.user.churchId;
        } catch (error) {
          console.error("Erro ao migrar usuário:", error);
          return false; // Impede o login se falhar
        }
      }

      return true;
    },

    async jwt({ token, user }) {
      // 📌 Se `user` existir, significa que acabamos de fazer login e temos os dados atualizados
      if (user) {
        console.log(
          "🟢 Atualizando token JWT com usuário atualizado do backend:",
          user
        );

        token.id = user.id || "";
        token.idProver = user.idProver || "";
        token.name = user.name || null;
        token.email = user.email || null;
        token.imageUrl = user.imageUrl || null;
        token.whatsapp = user.whatsapp || "";
        token.role = user.role || "user";
        token.churchId = user.churchId || "";
      }

      return token;
    },

    async session({ session, token }) {
      console.log("🔄 Criando sessão com os dados do token atualizado:", token);

      session.user = {
        id: token.id as string,
        idProver: token.idProver as string,
        name: token.name || "",
        email: token.email || "",
        emailVerified: null,
        imageUrl: token.imageUrl as string,
        whatsapp: token.whatsapp as string,
        role: token.role as string,
        churchId: token.churchId as string,
      };

      return session;
    },
  },

  pages: {
    signIn: "/welcome",
    error: "/auth/error",
  },

  secret: process.env.NEXTAUTH_SECRET,
});
