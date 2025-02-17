import { ZionApiResponse } from "@p40/common/contracts/church/zions";

export async function getChurchList(): Promise<ZionApiResponse[]> {
  const res = await fetch(`/api/church`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Zions");
  }

  return res.json();
}
