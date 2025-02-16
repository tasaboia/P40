import { FailException } from "@p40/common/contracts/exceptions/exception";
import api from "@p40/lib/axios";

export async function checkEmail(email: string): Promise<{
  exists: boolean;
}> {
  try {
    const response = await api.get(`/api/auth/check-email?email=${email}`);
    return response.data;
  } catch (error) {
    throw new FailException({
      message: "Erro ao verificar e-mail",
      statusCode: 500,
    });
  }
}
