import { ZionApiResponse } from "@p40/common/contracts/church/zions";
import { FailException } from "@p40/common/contracts/exceptions/exception";
import api from "@p40/lib/axios";

export async function getChurchList(): Promise<ZionApiResponse[]> {
  const res = await api.get("/api/church");

  if (res.status >= 400) {
    throw new FailException({
      statusCode: res.status,
      message: "Failed to fetch Zions",
    });
  }
  return res.data;
}
