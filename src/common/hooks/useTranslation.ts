import { useTranslations } from "next-intl";
import { useCallback } from "react";

type ValidNamespace =
  | "common"
  | "auth"
  | "zion"
  | "prayer"
  | "admin"
  | "checkin"
  | "errors"
  | "setup";

export function useTranslation(namespace: ValidNamespace) {
  const t = useTranslations(namespace);

  const translate = useCallback(
    (key: string, fallback?: string) => {
      try {
        return t(key as any);
      } catch (error) {
        console.warn(`Translation missing for key: ${namespace}.${key}`);
        return fallback || key;
      }
    },
    [t, namespace]
  );

  return {
    t: translate,
  };
}
