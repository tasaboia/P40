"use server";

import { revalidatePath } from "next/cache";

const prover = process.env.PROVER_BASE_URL;

export async function loginAction(prevState: any, formData: FormData) {
  "use server";

  const usuario = formData.get("usuario") as string;
  const senha = formData.get("senha") as string;

  try {
    const response = await fetch(`${prover}/login/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ usuario, senha }),
    });

    if (!response.ok) {
      return { error: "Usuário ou senha incorretos" };
    }

    const user = await response.json();
    revalidatePath("/");
    return { success: "Login bem-sucedido!", user };
  } catch (error) {
    return { error: "Erro ao conectar ao servidor. Tente novamente." };
  }
}
