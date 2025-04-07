import { FailException } from "@p40/common/contracts/exceptions/exception";
import api from "@p40/lib/axios";


export async function updateUserServiceAreas(userId: string, serviceAreaIds: string[]) {
  try {
    const response = await api.put(`/api/user/${userId}/service-areas`, {
      serviceAreaIds,
      userId
    });

    return response.data;
  } catch (error: any) {
    throw new FailException({
      message: error.response?.data?.message || "Erro ao atualizar áreas de serviço",
      statusCode: error.response?.status || 500,
    });
  }
} 