"use server";

import { revalidatePath } from "next/cache";

const prover = process.env.PROVER_BASE_URL;

export async function loginAction(
  prevState: { error?: string; success?: string; user?: any },
  formData: FormData
) {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { error: "Preencha todos os campos corretamente." };
  }

  try {
    const response = await fetch(`${prover}/login/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ usuario: email, senha: password }),
    });

    console.log("🔄 Resposta da API:", response);

    if (!response.ok) {
      return { error: "Usuário ou senha incorretos." };
    }

    const user = await response.json();

    revalidatePath("/");
    return { success: "Login bem-sucedido!", user };
  } catch (error) {
    console.error("❌ Erro na requisição:", error);
    return { error: "Erro ao conectar ao servidor. Tente novamente." };
  }
}
