import Log from "@p40/services/logging";
import { BaseException } from "../contracts/exceptions/exception";

export function errorHandler(error: unknown): Response {
  Log(error);
  if (error instanceof BaseException) {
    return new Response(
      JSON.stringify({
        error: error.errorType,
        message: error.message,
      }),
      {
        status: error.statusCode,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return new Response(
    JSON.stringify({
      error: "INTERNAL_ERROR",
      message: "Erro interno do servidor",
    }),
    {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }
  );
}
