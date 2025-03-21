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
import { motion } from "framer-motion";
import { Globe } from "lucide-react";

const languageFlags: Record<string, string> = {
  pt: "🇧🇷",
  en: "🇺🇸",
  es: "🇪🇸",
};

export function LanguageSwitcher() {
  const { locale, isPending, handleLanguageChange } = useChangeLanguage();
  const t = useTranslations("common.status");

  return (
    <div className="absolute top-1 right-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={isPending}>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            {isPending ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              >
                <Globe className="h-4 w-4" />
              </motion.div>
            ) : (
              <Globe className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[100px]">
          <DropdownMenuRadioGroup
            value={locale}
            onValueChange={handleLanguageChange}
          >
            {routing.locales.map((localeOption) => (
              <DropdownMenuRadioItem
                key={localeOption}
                value={localeOption}
                className="cursor-pointer text-center justify-center"
              >
                {localeOption.toUpperCase()}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
