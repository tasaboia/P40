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
  Clock,
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
import { UserEdit } from "../user-edit/user-edit";
import { TurnsUserList } from "../user-edit/turns-user";
import { User } from "@p40/common/contracts/user/user";

interface SettingsProps {
  user: User;
  turnItens: any[] | null;
}
export function Settings({ user, turnItens }: SettingsProps) {
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
          <TurnsUserList turnItens={turnItens} user={user} />
          <UserEdit user={user} />

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
