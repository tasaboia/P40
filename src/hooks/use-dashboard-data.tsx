"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllData, AllResponse } from "@p40/services/dashboard/dashboard-all";

export function useDashboardData(userId: string) {
  return useQuery<AllResponse>({
    queryKey: ["dashboard", userId],
    queryFn: () => getAllData(userId),
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
  });
}
