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

export function UserEdit({ user }) {
  const [formData, setFormData] = React.useState({
    id: user.id,
    name: user.name || "",
    email: user.email || "",
    whatsapp: user.whatsapp || "",
  });

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
        <div className="p-4">
          <form action={formAction}>
            <div className="grid gap-4">
              <input type="hidden" name="id" value={user.id} />
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Seu nome"
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="email@email.com"
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="whatsapp">Whatsapp</Label>
                <Input
                  id="whatsapp"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) =>
                    setFormData({ ...formData, whatsapp: e.target.value })
                  }
                  placeholder="11 99999-9999"
                />
              </div>
            </div>
            <SheetFooter className="flex flex-col py-4">
              <SheetClose asChild>
                <Button variant="outline">Cancelar</Button>
              </SheetClose>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="animate-spin" />}
                Atualizar
              </Button>
            </SheetFooter>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
