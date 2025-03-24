"use client";
import ZionSelect from "@p40/components/custom/select/zion-select";
import { Button } from "@p40/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@p40/components/ui/dialog";
import { CircleCheck } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Checkin() {
  const t = useTranslations("checkin");

  return (
    <Dialog open>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <ZionSelect />
        <div className="flex items-center flex-col gap-2">
          <div className="flex gap-2">
            <CircleCheck /> {t("status")}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline">
            {t("actions.back")}
          </Button>
          <Button type="submit">{t("actions.submit")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
