import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { notFound } from "next/navigation";
import { ReactNode } from "react";
import { routing } from "@p40/i18n/routing";
import BaseLayout from "@p40/components/custom/base-layout/base-layout";
import { Providers } from "../providers";
import { Inter } from "next/font/google";
import { clsx } from "clsx";
import { Toaster } from "@p40/components/ui";

const inter = Inter({ subsets: ["latin"] });

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

  const t = await getTranslations("auth");

  return {
    title: t("login.title"),
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!locale) {
    notFound();
  }
  const messages = await getMessages({ locale });

  setRequestLocale(locale);

  return (
    <html lang={locale} className="h-full">
      <body className={clsx(inter.className, "h-full")}>
        <Providers>
          <BaseLayout locale={locale} messages={messages}>
            {children}
            <Toaster />
          </BaseLayout>
        </Providers>
      </body>
    </html>
  );
}
