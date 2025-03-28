import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User extends Omit<DefaultUser, "emailVerified"> {
    id: string;
    idProver: string;
    name: string;
    email: string;
    imageUrl: string;
    whatsapp: string;
    role: string;
    churchId: string;
  }

  interface Session extends DefaultSession {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: User;
  }
}
