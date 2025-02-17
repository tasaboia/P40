"use client";

import { signIn } from "next-auth/react";

export async function loginAction(
  prevState: any,
  formData: FormData
): Promise<{ error: boolean; message?: string }> {
  const username = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const zionId = formData.get("zionId")?.toString();

  const result = await signIn("credentials", {
    username,
    password,
    zionId,
    redirect: false,
  });

  if (result?.error) {
    return {
      error: true,
      message: result.error,
    };
  }

  return {
    error: false,
  };
}
