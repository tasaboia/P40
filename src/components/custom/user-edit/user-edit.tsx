"use client";

import * as React from "react";
import { Loader2, UserCog } from "lucide-react";
import { Button } from "@p40/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@p40/components/ui/drawer";
import { Label } from "@p40/components/ui/label";
import { Input } from "@p40/components/ui/input";
import { toast } from "@p40/hooks/use-toast";
import { useActionState } from "react";
import { updateUser } from "@p40/services/user/user-service";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function UserEdit({ user }) {
  const { data: session, update } = useSession();
  const [drawerHeight, setDrawerHeight] = React.useState("80%");
  const router = useRouter();
  const [formData, setFormData] = React.useState({
    id: user.id,
    name: user.name || "",
    email: user.email || "",
    whatsapp: user.whatsapp || "",
  });

  React.useEffect(() => {
    const updateHeight = () => {
      const viewportHeight =
        window.visualViewport?.height || window.innerHeight;
      const screenHeight = window.innerHeight;

      setDrawerHeight(viewportHeight < screenHeight ? "60%" : "80%");
    };

    window.visualViewport?.addEventListener("resize", updateHeight);
    return () => {
      window.visualViewport?.removeEventListener("resize", updateHeight);
    };
  }, []);

  const [state, formAction, isPending] = useActionState(updateUser, {
    success: false,
    error: null,
  });

  React.useEffect(() => {
    if (state.success) {
      toast({
        variant: "success",
        title: "Sucesso",
        description: "Suas informações foram atualiadas",
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
    <Drawer>
      <DrawerTrigger asChild>
        <div className="flex p-[6px] rounded mb-1 transition-colors hover:bg-accent hover:text-accent-foreground gap-2 items-center text-sm px-2">
          <UserCog className="h-4 w-4" />
          <Button variant="ghost" className="font-normal text-sm p-0 h-[20px]">
            Meus dados
          </Button>
        </div>
      </DrawerTrigger>
      <DrawerContent
        className="transition-all overflow-y-auto"
        style={{ height: drawerHeight }}
      >
        <div className="mx-auto w-full max-w-sm overflow-y-auto pb-32">
          <DrawerHeader>
            <DrawerTitle>Meu Perfil</DrawerTitle>
            <DrawerDescription>Atualize seus dados</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <form action={formAction}>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <input type="hidden" name="id" value={user.id} />
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
              <DrawerFooter className="px-0">
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending && <Loader2 className="animate-spin" />}
                  Atualizar
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DrawerClose>
              </DrawerFooter>
            </form>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
