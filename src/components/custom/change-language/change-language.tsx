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
import { useTranslations } from "next-intl";
import { Globe } from "lucide-react";

export function ChangeLanguage() {
  const { locale, isPending, handleLanguageChange } = useChangeLanguage();
  const t = useTranslations("common.status");

  return (
    <div className="fixed top-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={isPending}>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full px-3 shadow-md hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          >
            <Globe className="mr-2 h-4 w-4" />
            <span className="font-medium">
              {locale ? locale.toUpperCase() : t("loading")}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-36 border-none shadow-lg rounded-xl p-1 bg-card/95 backdrop-blur-sm"
        >
          <DropdownMenuRadioGroup
            value={locale}
            onValueChange={handleLanguageChange}
          >
            {routing.locales.map((locale) => (
              <DropdownMenuRadioItem
                key={locale}
                value={locale}
                className="cursor-pointer rounded-lg font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-200 focus:bg-primary focus:text-primary-foreground"
              >
                {locale === "pt"
                  ? "🇧🇷 Português"
                  : locale === "en"
                  ? "🇺🇸 English"
                  : locale.toUpperCase()}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
