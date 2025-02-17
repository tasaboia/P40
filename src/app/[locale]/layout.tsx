import { ChangeLanguage } from "@p40/components/custom/menu-language/menu-language";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ReactNode } from "react";
import { routing } from "@p40/i18n/routing";
import { Toaster } from "@p40/components/ui/toaster";
import BaseLayout from "@p40/components/custom/base-layout/base-layout";

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
      <Toaster />
    </BaseLayout>
  );
}
