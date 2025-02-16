"use client";

import { signIn } from "next-auth/react";

export async function loginAction(prevState: any, formData: FormData) {
  const username = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!username || !password) {
    return { error: "Preencha todos os campos corretamente." };
  }

  const result = await signIn("credentials", {
    username,
    password,
    redirect: false,
  });

  if (result?.error) {
    return { error: result.error };
  }

  return { success: "Login bem-sucedido!" };
}
