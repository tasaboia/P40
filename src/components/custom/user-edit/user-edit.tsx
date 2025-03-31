"use client";

import * as React from "react";
import { Loader2, UserCog } from "lucide-react";
import { Button } from "@p40/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@p40/components/ui/sheet";
import { Label } from "@p40/components/ui/label";
import { Input } from "@p40/components/ui/input";
import { toast } from "@p40/hooks/use-toast";
import { useActionState } from "react";
import { updateUser } from "@p40/services/user/user-service";
import { PhoneInput } from "../input-phone/input-phone";
import { useTranslations } from "next-intl";

const formatPhoneNumber = (phone: string | null): string => {
  if (!phone) return '';
  
  // Remove todos os espaços, traços e caracteres especiais
  // Mantém apenas números e o + inicial
  const cleanNumber = phone
    .replace(/^\++/, '') // Remove + extras do início
    .replace(/[^0-9]/g, ''); // Remove tudo que não for número
    
  return cleanNumber ? `+${cleanNumber}` : '';
};

export function UserEdit({ user }) {
  const [state, formAction, isPending] = useActionState(updateUser, {
    success: false,
    error: null,
  });
  const t = useTranslations("common");

  React.useEffect(() => {

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
    <Sheet>
      <SheetTrigger asChild>
        <div className="flex p-[6px] rounded mb-1 transition-colors hover:bg-accent hover:text-accent-foreground gap-2 items-center text-sm px-2">
          <UserCog className="h-4 w-4" />
          <Button variant="ghost" className="font-normal text-sm p-0 h-[20px]">
            {t("user.my_data")}
          </Button>
        </div>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t("user.profile")}</SheetTitle>
          <SheetDescription>{t("user.update_data")}</SheetDescription>
        </SheetHeader>
        <div className="p-3">
          <form action={formAction}>
            <div className="flex flex-col gap-4">
              <input type="hidden" name="id" value={user.id} />

              <div className="flex  flex-col  gap-1 space-y-1.5">
                <Label htmlFor="name">{t("user.name")}</Label>
                <Input
                  name="name"
                  type="text"
                  id="name"
                  defaultValue={user?.name}
                  className="col-span-3"
                />
              </div>

              <div className="flex  flex-col  gap-1 space-y-1.5">
                <Label htmlFor="email">{t("user.email")}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={user?.email}
                  className="col-span-3"
                />
              </div>

              <div className="flex flex-col  gap-1 space-y-1.5">
                <Label htmlFor="whatsapp">{t("user.whatsapp")}</Label>
                <PhoneInput
                  id="whatsapp"
                  name="whatsapp"
                  value={formatPhoneNumber(user?.whatsapp)}
                  international
                  placeholder="11 99999-9999"
                />
              </div>
            </div>
            <SheetFooter className="flex flex-col py-4 gap-4">
              <Button type="submit" disabled={isPending}>
                {isPending && (
                  <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-primary"></div>
                )}
                {t("actions.submit")}
              </Button>
              <SheetClose asChild>
                <Button variant="outline">{t("actions.cancel")}</Button>
              </SheetClose>
            </SheetFooter>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
