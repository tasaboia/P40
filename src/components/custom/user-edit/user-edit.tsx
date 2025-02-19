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

export function UserEdit({ user }) {
  const [state, formAction, isPending] = useActionState(updateUser, {
    success: false,
    error: null,
  });

  React.useEffect(() => {
    if (state.success) {
      toast({
        variant: "success",
        title: "Sucesso",
        description: "Suas informações foram atualizadas",
      });
      setTimeout(() => {
        window.location.reload();
      }, 400);
    } else if (state.error) {
      toast({
        variant: "destructive",
        title: "Erro!",
        description: state.error || "Não foi possível atualizar seus dados.",
      });
    }
  }, [state]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="flex p-[6px] rounded mb-1 transition-colors hover:bg-accent hover:text-accent-foreground gap-2 items-center text-sm px-2">
          <UserCog className="h-4 w-4" />
          <Button variant="ghost" className="font-normal text-sm p-0 h-[20px]">
            Meus dados
          </Button>
        </div>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Meu Perfil</SheetTitle>
          <SheetDescription>Atualize seus dados</SheetDescription>
        </SheetHeader>
        <div className="p-3">
          <form action={formAction}>
            <div className="flex flex-col gap-4">
              <input type="hidden" name="id" value={user.id} />

              <div className="flex  flex-col  gap-1 space-y-1.5">
                <Label htmlFor="name">Nome</Label>
                <Input
                  name="name"
                  type="text"
                  id="name"
                  defaultValue={user?.name}
                  className="col-span-3"
                />
              </div>

              <div className="flex  flex-col  gap-1 space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={user?.email}
                  className="col-span-3"
                />
              </div>

              <div className="flex flex-col  gap-1 space-y-1.5">
                <Label htmlFor="whatsapp">Whatsapp</Label>
                <PhoneInput
                  id="whatsapp"
                  name="whatsapp"
                  value={`+${user?.whatsapp}`}
                  international
                  placeholder="11 99999-9999"
                />
              </div>
            </div>
            <SheetFooter className="flex flex-col py-4 gap-4">
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="animate-spin" />}
                Atualizar
              </Button>
              <SheetClose asChild>
                <Button variant="outline">Cancelar</Button>
              </SheetClose>
            </SheetFooter>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
