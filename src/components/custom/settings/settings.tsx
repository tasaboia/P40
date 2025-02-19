"use client";

import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@p40/components/ui/dropdown-menu";
import {
  FileText,
  Languages,
  LogOut,
  Menu,
  MessageCircleWarning,
  UserCog,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useChangeLanguage } from "@p40/common/hook/useChangeLanguage";
import { routing } from "@p40/i18n/routing";

export function Settings() {
  const { locale, isPending, handleLanguageChange } = useChangeLanguage();

  return (
    <div className=" absolute top-4 right-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Menu />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuItem>
            <FileText />
            Pautas diárias
          </DropdownMenuItem>
          <DropdownMenuItem>
            <MessageCircleWarning />
            Ocorrências
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Ajustes</DropdownMenuLabel>
          <DropdownMenuItem>
            <UserCog />
            Meu dados
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Languages />
              Idioma
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  value={locale}
                  onValueChange={handleLanguageChange}
                >
                  {routing.locales.map((locale) => (
                    <DropdownMenuRadioItem key={locale} value={locale}>
                      {locale.toUpperCase()}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => signOut()}>
            <LogOut className="h-6 w-6 " />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
