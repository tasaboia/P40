import { ZionApiResponse } from "../types/zions/zions";

export async function getZions(): Promise<ZionApiResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/zions`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Zions");
  }

  return res.json();
}
