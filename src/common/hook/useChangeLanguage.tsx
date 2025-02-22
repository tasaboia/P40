import * as React from "react";

import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { usePathname, useRouter } from "@p40/i18n/routing";

export function useChangeLanguage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = useLocale();
  const [isPending, startTransition] = React.useTransition();

  const handleLanguageChange = (value: "en" | "pt") => {
    if (value === locale) {
      return;
    }
    startTransition(() => {
      // @ts-expect-error -- TypeScript will validate that only known `params`
      // are used in combination with a given `pathname`. Since the two will
      // always match for the current route, we can skip runtime checks.
      router.replace({ pathname, params }, { locale: value });
    });
  };

  return { locale, isPending, handleLanguageChange };
}
