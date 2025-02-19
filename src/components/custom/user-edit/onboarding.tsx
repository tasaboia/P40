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

export function Onboarding({ user }) {
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

        <form action={formAction} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <Input
              name="name"
              type="text"
              id="name"
              defaultValue={user.name}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={user.email}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="whatsapp" className="text-right">
              WhatsApp
            </Label>
            <Input
              id="whatsapp"
              name="whatsapp"
              type="text"
              defaultValue={user.whatsapp}
              className="col-span-3"
            />
          </div>
          <input type="hidden" name="id" value={user.id} />
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
