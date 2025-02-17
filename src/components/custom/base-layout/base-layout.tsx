import { clsx } from "clsx";
import { Inter } from "next/font/google";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
const inter = Inter({ subsets: ["latin"] });

type Props = {
  children: ReactNode;
  locale: string;
};

export default async function BaseLayout({ children, locale }: Props) {
  const messages = await getMessages({ locale });

  return (
    <html className="h-full" lang={locale}>
      <body className={clsx(inter.className, "flex h-full flex-col")}>
        <NextIntlClientProvider
          locale={locale}
          messages={
            JSON.parse(
              JSON.stringify(messages)
            ) as unknown as AbstractIntlMessages
          }
        >
          <SessionProvider>{children}</SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
