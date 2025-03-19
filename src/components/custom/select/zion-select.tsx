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
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { useZionQueries } from "@p40/hooks/use-zion-queries";
import { Church, ZionApiResponse } from "@p40/common/contracts/church/zions";

// Componente memoizado para o item da igreja
const ChurchItem = React.memo(({ church }: { church: Church }) => (
  <SelectItem key={church.id} value={church.id}>
    {church.name}
  </SelectItem>
));

ChurchItem.displayName = "ChurchItem";

// Componente memoizado para o grupo de regiões
const RegionGroup = React.memo(
  ({ zion, regionName }: { zion: ZionApiResponse; regionName: string }) => (
    <SelectGroup key={zion.region.id}>
      <SelectLabel>{regionName}</SelectLabel>
      {zion.churches.map((church) => (
        <ChurchItem key={church.id} church={church} />
      ))}
    </SelectGroup>
  )
);

RegionGroup.displayName = "RegionGroup";

export default function ZionSelect() {
  const { zions, isLoading, error, setSelectedZion } = useZionQueries();
  const t = useTranslations("zion.select");
  const actions = useTranslations("common.actions");

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{t("loading")}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive">
        <p>{t("error")}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-primary hover:underline"
        >
          {actions("retry")}
        </button>
      </div>
    );
  }

  if (!zions || zions.length === 0) {
    return (
      <div className="text-muted-foreground">
        <p>{t("empty")}</p>
      </div>
    );
  }

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
      <SelectTrigger className="w-full">
        <SelectValue placeholder={t("title")} />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {zions.map((zion) => (
          <RegionGroup
            key={zion.region.id}
            zion={zion}
            regionName={t(`regions.${zion.region.code}`)}
          />
        ))}
      </SelectContent>
    </Select>
  );
}
