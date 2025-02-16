export enum RegionCode {
  BRAZIL = "BR",
  EUROPE = "EU",
  NORTH_AMERICA = "NA",
  LATIN_AMERICA = "LATAM",
  GLOBAL = "GLOBAL",
}

export interface Region {
  id: string;
  name: string;
  code: RegionCode;
}

export interface Church {
  id: string;
  name: string;
  city: string;
  country: string;
}

export interface ZionApiResponse {
  region: Region;
  churches: Church[];
}
