import { ZionApiResponse } from "@p40/common/contracts/church/zions";
import { FailException } from "@p40/common/contracts/exceptions/exception";
import { errorHandler } from "@p40/common/utils/erro-handler";
import api from "@p40/lib/axios";

export async function getChurchList(): Promise<ZionApiResponse[]> {
  try {
    const res = await api.get("/api/church/list");

    return res.data;
  } catch (error) {
    errorHandler(error);
  }
}
