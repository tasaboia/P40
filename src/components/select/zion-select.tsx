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

export async function ZionSelect() {
  const zions = await getZions();

  return (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Selecione sua Zion" />
      </SelectTrigger>
      <SelectContent>
        <SelectContent>
          {(Object.keys(zions) as (keyof typeof Region)[]).map((region) => (
            <SelectGroup key={region}>
              <SelectLabel>{getRegionName(region)}</SelectLabel>
              {zions[region].map((church) => (
                <SelectItem key={church.id} value={church.id}>
                  {church.name}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </SelectContent>
    </Select>
  );
}
