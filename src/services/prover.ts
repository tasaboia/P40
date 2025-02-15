const prover = process.env.PROVER_BASE_URL;

export async function authProver(username: string, password: string) {
  const response = await fetch(`${prover}/login/user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      usuario: username,
      senha: password,
    }),
  });

  if (!response.ok) {
    throw new Error("Usuário ou senha incorretos.");
  }

  return await response.json();
}
