"use client";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { routing, usePathname, useRouter } from "@p40/i18n/routing";
import { useTransition, useEffect, useState } from "react";

export function ChangeLanguage() {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const currentLang =
    routing.locales.find((locale) => pathname.startsWith(`/${locale}`)) ||
    routing.defaultLocale;
  const [selectedLang, setSelectedLang] = useState(currentLang);

  useEffect(() => {
    setSelectedLang(currentLang);
  }, [pathname]);

  const handleLanguageChange = (value: "en" | "pt") => {
    if (value === selectedLang) return;
    startTransition(() => {
      const newPathname = `${value}${pathname.replace(/^\/(en|pt)/, "")}`;
      router.replace(newPathname);
      setSelectedLang(value);
    });
  };

  return (
    <ToggleGroup
      variant="outline"
      type="single"
      // value={selectedLang}
      onValueChange={(value) =>
        value && handleLanguageChange(value as "en" | "pt")
      }
      disabled={isPending}
    >
      {routing.locales.map((locale) => (
        <ToggleGroupItem
          key={locale}
          value={locale}
          aria-label={`Mudar para ${locale}`}
        >
          {locale.toUpperCase()}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
