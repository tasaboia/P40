"use client";

import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@p40/components/ui/dropdown-menu";
import { FileText, LogOut, Menu, MessageCircleWarning } from "lucide-react";
import { signOut } from "next-auth/react";

export function Logout() {
  return (
    <div className=" absolute top-4 right-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Menu />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          {/* <DropdownMenuLabel>
           
          </DropdownMenuLabel> */}
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <FileText />
            Pautas diárias
          </DropdownMenuItem>
          <DropdownMenuItem>
            <MessageCircleWarning />
            Ocorrências
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut()}>
            <div className="flex w-full cursor-pointer justify-between p-2 items-center text-sm px-2">
              Sair
              <LogOut className="h-6 w-6 " />
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
