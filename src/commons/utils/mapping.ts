import { Region } from "../types/zions/zions";

export function getRegionName(regionKey: keyof typeof Region): string {
  return Region[regionKey] || regionKey;
}
