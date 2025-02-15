import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { getZions } from "@p40/commons/services/zion";
import { getRegionName } from "@p40/commons/utils/mapping";
import { Region } from "@p40/commons/types/zions/zions";

export default async function Onboarding() {
  const zions = await getZions();

  return (
    <Select>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Escolha sua Zion" />
      </SelectTrigger>
      <SelectContent>
        <SelectContent>
          {Object.entries(zions).map(([region, zionList]) => (
            <SelectGroup key={region}>
              <SelectLabel>
                {getRegionName(region as keyof typeof Region)}
              </SelectLabel>
              {zionList.map((zion) => (
                <SelectItem key={zion.id} value={zion.id}>
                  {zion.name}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </SelectContent>
    </Select>
  );
}
