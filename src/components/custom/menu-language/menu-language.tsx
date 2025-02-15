"use client";

import * as React from "react";

import { routing } from "@p40/i18n/routing";
import { useChangeLanguage } from "@p40/common/hook/useChangeLanguage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@p40/components/ui/dropdown-menu";
import { Button } from "@p40/components/ui/button";

export function ChangeLanguage() {
  const { locale, isPending, handleLanguageChange } = useChangeLanguage();

  return (
    <div className=" absolute top-4 right-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={isPending}>
          <Button variant="outline">
            {locale ? locale.toUpperCase() : "Carregando..."}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
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
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
