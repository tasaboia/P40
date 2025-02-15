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
import { Region } from "@p40/common/types/zions/zions";
import { useSettingStore } from "@p40/common/states/zion";
import { useTranslations } from "next-intl";

export default function ZionSelect() {
  const { zions, fetchZions, setSelectedZion } = useSettingStore();

  React.useEffect(() => {
    fetchZions();
  }, [fetchZions]);
  const t = useTranslations("zionSelect"); // Pega as traduções da chave "zionSelect"

  if (!zions) return <p>Carregando Zions...</p>;

  return (
    <Select
      onValueChange={(value) => {
        const selectedChurch = Object.values(zions)
          .flat()
          .find((church) => church.id === value);

        if (selectedChurch) {
          setSelectedZion(selectedChurch);
        }
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder={t("title")} />
      </SelectTrigger>
      <SelectContent>
        <SelectContent>
          {(Object.keys(zions) as (keyof typeof Region)[]).map((region) => (
            <SelectGroup key={region}>
              <SelectLabel>{t(`regions.${region}`)}</SelectLabel>

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
