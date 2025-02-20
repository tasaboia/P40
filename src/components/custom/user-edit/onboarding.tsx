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

export function Onboarding({ user }) {
  const { selectedZion } = useSettingStore();
  const [state, formAction, isPending] = useActionState(updateUser, {
    success: false,
    error: null,
  });

  useEffect(() => {
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
    <Dialog open>
      <DialogContent className="sm:max-w-[425px] rounded-lg">
        <DialogHeader>
          <DialogTitle>Confirme seus dados</DialogTitle>
          <DialogDescription>
            Atualize seus dados caso necessário
          </DialogDescription>
        </DialogHeader>

        <form action={formAction}>
          <input
            type="hidden"
            name="zionId"
            id="zionId"
            value={selectedZion?.id}
          />
          <div className="flex flex-col gap-4 py-6">
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

          <input type="hidden" name="id" value={user?.id} />
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              Confirmar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
