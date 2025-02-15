import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ReactNode } from "react";
import { LocaleType, routing } from "@p40/i18n/routing";
import BaseLayout from "@p40/components/base-layout/base-layout";
import { ChangeLanguage } from "@p40/components/menu-language/menu-language";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locale) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "geral" });

  return {
    title: t("title"),
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!locale) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <BaseLayout locale={locale}>
      <ChangeLanguage />
      {children}
    </BaseLayout>
  );
}
