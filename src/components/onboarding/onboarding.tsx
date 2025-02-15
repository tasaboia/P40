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

export default function Onboarding() {
  return (
    <Select>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Escolha sua Zion" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Zion Brasil</SelectLabel>
          <SelectItem value="est">São Paulo</SelectItem>
          <SelectItem value="cst">Santos</SelectItem>
          <SelectItem value="mst">Campinas</SelectItem>
          <SelectItem value="pst">Recife</SelectItem>
          <SelectItem value="akst">Campo Grande</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Zion Europa</SelectLabel>
          <SelectItem value="gmt">Lisboa</SelectItem>
          <SelectItem value="cet">Porto</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
