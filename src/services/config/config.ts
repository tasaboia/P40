import api from "@p40/lib/axios";
import { FailException } from "@p40/common/contracts/exceptions/exception";
import { AppResponse } from "@p40/common/contracts/config/config";

export async function getAppConfig(userId: string): Promise<AppResponse> {
  try {
    const response = await api.get(`/api/config?userId=${userId}`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    throw new FailException({
      message: error.response?.data?.message,
      statusCode: error.response?.status || 500,
    });
  }
}
