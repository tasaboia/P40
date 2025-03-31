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
  Settings2Icon,
  SettingsIcon,
  UserCog,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useChangeLanguage } from "@p40/common/hook/useChangeLanguage";
import { routing } from "@p40/i18n/routing";
import { UserEdit } from "../user-edit/user-edit";
import { TurnsUserList } from "../user-edit/turns-user";
import { User } from "@p40/common/contracts/user/user";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

interface SettingsProps {
  user: User;
  turnItens: any[] | null;
}

export function Settings({ user, turnItens }: SettingsProps) {
  const { locale, handleLanguageChange } = useChangeLanguage();
  const t = useTranslations("common");
  const pathname = usePathname();
  const isCheckInPage = pathname.includes("check-in");

  const handleLogout = () => {
    const callbackUrl =  isCheckInPage ? `/${locale}/check-in/login` : `/${locale}/login`
    signOut({ callbackUrl });
  };

  return (
    <div className="absolute top-4 right-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Menu />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
        { !isCheckInPage && 
        
        <><DropdownMenuLabel>{t("actions.settings")}</DropdownMenuLabel>
          {turnItens?.length > 0 && (
            <TurnsUserList turnItens={turnItens} user={user} />
          )}
          <UserEdit user={user} /></>
        }
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Languages />
              {t("actions.language")}
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

          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="h-6 w-6" />
            {t("actions.logout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
