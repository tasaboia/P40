import { ZionApiResponse } from "@p40/common/types/zions/zions";

export async function getZions(): Promise<ZionApiResponse> {
  const res = await fetch(`/api/zions`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Zions");
  }

  return res.json();
}
