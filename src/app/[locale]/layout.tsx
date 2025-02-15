import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ReactNode } from "react";
import { LocaleType, routing } from "@p40/i18n/routing";
import BaseLayout from "@p40/components/base-layout/base-layout";

type Props = {
  children: ReactNode;
  params: { locale: string };
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// export async function generateMetadata({
//   params: { locale },
// }: Omit<Props, "children">) {
//   const t = await getTranslations({ locale, namespace: "LocaleLayout" });

//   return {
//     title: t("title"),
//   };
// }

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale;

  // ✅ Verificamos se o idioma é válido
  if (!routing.locales.includes(locale as LocaleType)) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "LocaleLayout" });

  return {
    title: t("title"),
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: Props) {
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  return <BaseLayout locale={locale}>{children}</BaseLayout>;
}
