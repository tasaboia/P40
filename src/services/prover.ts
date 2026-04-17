import { FailException } from "@p40/common/contracts/exceptions/exception";

export async function authProver(
  username: string,
  password: string,
  zionId: string,
  serviceAreas: any
) {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    if (!baseUrl) {
      throw new FailException({
        message: "Base URL da API não configurada.",
        statusCode: 500,
      });
    }

    const response = await fetch(new URL("/api/auth/migrar", baseUrl), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        username,
        password,
        zionId,
        serviceAreas,
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new FailException({
        message: payload?.message || "Usuário ou senha incorretos.",
        statusCode: response.status,
      });
    }

    return payload.user;
  } catch (error) {
    throw new FailException({
      message:
        error instanceof FailException
          ? error.message
          : "Usuário ou senha incorretos.",
      statusCode:
        error instanceof FailException ? error.statusCode : 500,
    });
  }
}
