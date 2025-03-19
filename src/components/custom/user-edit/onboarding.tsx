"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@p40/components/ui/dialog";
import { Button } from "@p40/components/ui/button";
import { Label } from "@p40/components/ui/label";
import { Input } from "@p40/components/ui/input";
import { useActionState, useEffect } from "react";
import { updateUser } from "@p40/services/user/user-service";
import { Loader2 } from "lucide-react";
import { toast } from "@p40/hooks/use-toast";
import { useSettingStore } from "@p40/common/states/zion";
import { PhoneInput } from "../input-phone/input-phone";
import { useTranslations } from "next-intl";

export function Onboarding({ user }) {
  const { selectedZion } = useSettingStore();
  const [state, formAction, isPending] = useActionState(updateUser, {
    success: false,
    error: null,
  });
  const t = useTranslations("common");

  useEffect(() => {
    if (state.success) {
      toast({
        variant: "success",
        title: t("status.success"),
        description: t("user.update_success"),
      });
      setTimeout(() => {
        window.location.reload();
      }, 400);
    } else if (state.error) {
      toast({
        variant: "destructive",
        title: t("status.error"),
        description: state.error || t("user.update_error"),
      });
    }
  }, [state, t]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">{t("user.my_data")}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("user.profile")}</DialogTitle>
          <DialogDescription>{t("user.update_data")}</DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <div className="grid gap-4 py-4">
            <input type="hidden" name="id" value={user.id} />
            <input type="hidden" name="churchId" value={selectedZion?.id} />

            <div className="flex flex-col gap-1 space-y-1.5">
              <Label htmlFor="name">{t("user.name")}</Label>
              <Input
                name="name"
                type="text"
                id="name"
                defaultValue={user?.name}
                className="col-span-3"
              />
            </div>

            <div className="flex flex-col gap-1 space-y-1.5">
              <Label htmlFor="email">{t("user.email")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={user?.email}
                className="col-span-3"
              />
            </div>

            <div className="flex flex-col gap-1 space-y-1.5">
              <Label htmlFor="whatsapp">{t("user.whatsapp")}</Label>
              <PhoneInput
                id="whatsapp"
                name="whatsapp"
                value={`+${user?.whatsapp}`}
                international
                placeholder="11 99999-9999"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              {t("actions.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
