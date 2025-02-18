import { Church, ZionApiResponse } from "@p40/common/contracts/church/zions";
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

export async function getChurchById(churchId: string): Promise<Church | null> {
  try {
    const res = await api.get(`/api/church?churchId=${churchId}`);

    return res.data;
  } catch (error) {
    errorHandler(error);
  }
}
