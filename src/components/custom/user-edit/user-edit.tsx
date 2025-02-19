// "use client";

// import * as React from "react";
// import { UserCog } from "lucide-react";
// import { Button } from "@p40/components/ui/button";
// import {
//   Drawer,
//   DrawerClose,
//   DrawerContent,
//   DrawerDescription,
//   DrawerFooter,
//   DrawerHeader,
//   DrawerTitle,
//   DrawerTrigger,
// } from "@p40/components/ui/drawer";
// import { Label } from "@p40/components/ui/label";
// import { Input } from "@p40/components/ui/input";

// export function UserEdit() {
//   const [drawerHeight, setDrawerHeight] = React.useState("80%");

//   React.useEffect(() => {
//     const updateHeight = () => {
//       const viewportHeight =
//         window.visualViewport?.height || window.innerHeight;
//       const screenHeight = window.innerHeight;

//       if (viewportHeight < screenHeight) {
//         setDrawerHeight("60%");
//       } else {
//         setDrawerHeight("80%");
//       }
//     };

//     window.visualViewport?.addEventListener("resize", updateHeight);
//     return () => {
//       window.visualViewport?.removeEventListener("resize", updateHeight);
//     };
//   }, []);

//   return (
//     <Drawer>
//       <DrawerTrigger asChild>
//         <div className="flex p-[6px] rounded mb-1 transition-colors hover:bg-accent hover:text-accent-foreground gap-2 items-center text-sm px-2">
//           <UserCog className="h-4 w-4" />
//           <Button variant="ghost" className="font-normal text-sm p-0 h-[20px]">
//             Meus dados
//           </Button>
//         </div>
//       </DrawerTrigger>
//       <DrawerContent
//         className="transition-all"
//         style={{ height: drawerHeight }}
//       >
//         <div className="mx-auto w-full max-w-sm overflow-auto">
//           <DrawerHeader>
//             <DrawerTitle>Meu Perfil</DrawerTitle>
//             <DrawerDescription>Atualize seus dados</DrawerDescription>
//           </DrawerHeader>
//           <div className="p-4 pb-0">
//             <form>
//               <div className="grid w-full items-center gap-4">
//                 <div className="flex flex-col space-y-1.5">
//                   <Label htmlFor="name">Nome</Label>
//                   <Input id="name" placeholder="Seu nome" />
//                 </div>
//                 <div className="flex flex-col space-y-1.5">
//                   <Label htmlFor="email">Email</Label>
//                   <Input id="email" placeholder="email@email.com" />
//                 </div>
//                 <div className="flex flex-col space-y-1.5">
//                   <Label htmlFor="whatsapp">Whatsapp</Label>
//                   <Input id="whatsapp" placeholder="11 99999-9999" />
//                 </div>
//               </div>
//             </form>
//           </div>
//           <DrawerFooter>
//             <Button>Atualizar</Button>
//             <DrawerClose asChild>
//               <Button variant="outline">Cancelar</Button>
//             </DrawerClose>
//           </DrawerFooter>
//         </div>
//       </DrawerContent>
//     </Drawer>
//   );
// }

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
import { updateUser } from "@p40/services/user/user-service";
import { toast } from "@p40/hooks/use-toast";

export function UserEdit({ user }) {
  const [drawerHeight, setDrawerHeight] = React.useState("80%");
  const [loading, setLoading] = React.useState(false);
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const response = await updateUser(formData);

    if (response.success) {
      toast({
        variant: "success",
        title: "Sucesso!",
        description: "Seus dados foram atualizados com sucesso.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Erro!",
        description: response.error || "Não foi possível atualizar seus dados.",
      });
    }
    setLoading(false);
  };

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
            <form onSubmit={handleSubmit}>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
                    placeholder="11 99999-9999"
                  />
                </div>
              </div>
              <DrawerFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="animate-spin" />}
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
