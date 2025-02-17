"use client";
import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { useSettingStore } from "@p40/common/states/zion";
import { useTranslations } from "next-intl";

export default function ZionSelect() {
  const { zions, fetchZions, setSelectedZion } = useSettingStore();

  React.useEffect(() => {
    fetchZions();
  }, [fetchZions]);
  const t = useTranslations("zionSelect");

  if (!zions || zions.length === 0) return <p>Carregando Igrejas...</p>;

  return (
    <Select
      onValueChange={(value) => {
        const selectedChurch = zions
          .flatMap((zion) => zion.churches)
          .find((church) => church.id === value);

        if (selectedChurch) {
          setSelectedZion(selectedChurch);
        }
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder={t("title")} />
      </SelectTrigger>
      <SelectContent className="max-h-[200px]">
        {zions.map((zion) => (
          <SelectGroup key={zion.region.id}>
            <SelectLabel>{t(`regions.${zion.region.code}`)}</SelectLabel>
            {zion.churches.map((church) => (
              <SelectItem key={church.id} value={church.id}>
                {church.name}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
