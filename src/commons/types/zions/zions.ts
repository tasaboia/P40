export enum Region {
  BRAZIL = "Brasil",
  EUROPE = "Europa",
  NORTH_AMERICA = "America do Norte",
  LATIN_AMERICA = "America Latina",
  GLOBAL = "Global",
}

export interface TimeZone {
  id: string;
  name: string;
  offset: string;
}

export interface Zion {
  id: string;
  name: string;
  address?: string;
  city: string;
  country: string;
  region: Region;
  timeZoneId: string;
  timeZone: TimeZone;
}

export type ZionApiResponse = {
  [key in Region]: Zion[];
};
