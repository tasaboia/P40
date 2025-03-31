import api from "@p40/lib/axios";
import { FailException } from "@p40/common/contracts/exceptions/exception";

export async function authProver(
  username: string,
  password: string,
  zionId: string,
  serviceAreas: any
) {

  console.log("serviceAreas:", serviceAreas);
  try {
    const response = await api.post("/api/auth/migrar", {
      username,
      password,
      zionId,
      serviceAreas: serviceAreas
    });

    return response.data.user;
  } catch (error) {
    console.log(error);
    throw new FailException({
      message: error.response?.data?.message || "Usuário ou senha incorretos.",
      statusCode: error.response?.status || 500,
    });
  }
}
