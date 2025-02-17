import api from "@p40/lib/axios";
import { FailException } from "@p40/common/contracts/exceptions/exception";

export async function getAppConfig(churchId: string) {
  try {
    const response = await api.get(`/api/config?id=${churchId}`);
    return response.data;
  } catch (error) {
    throw new FailException({
      message: error.response?.data?.message,
      statusCode: error.response?.status || 500,
    });
  }
}
