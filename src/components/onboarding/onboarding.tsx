"use client"; // 🔥 Garantimos que este é um Client Component

import { getRegionName } from "@p40/commons/utils/mapping";
import { Region, Zion } from "@p40/commons/types/zions/zions";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useZionStore } from "@p40/commons/states/zion";

interface OnboardingClientProps {
  zions: { [key in Region]: Zion[] };
}

export default function OnboardingClient({ zions }: OnboardingClientProps) {
  const { selectedZion, setSelectedZion } = useZionStore();

  return (
    <Select
      value={selectedZion?.id ?? ""}
      onValueChange={(zionId) => {
        const selected = Object.values(zions)
          .flat()
          .find((zion) => zion.id === zionId);
        if (selected) setSelectedZion(selected);
      }}
    >
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Escolha sua Zion">
          {selectedZion?.name ?? "Escolha sua Zion"}
        </SelectValue>
      </SelectTrigger>
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
    </Select>
  );
}
