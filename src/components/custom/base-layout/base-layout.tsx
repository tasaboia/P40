import { clsx } from "clsx";
import { Inter } from "next/font/google";
import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import IntlProvider from "@p40/common/provider/IntlProvider";
import { AbstractIntlMessages } from "next-intl";
import { Toaster } from "@p40/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

type Props = {
  children: ReactNode;
  locale: string;
  messages: AbstractIntlMessages;
};

export default async function BaseLayout({
  children,
  locale,
  messages,
}: Props) {
  return (
    <div className={clsx(inter.className, "flex h-full flex-col bg-white")}>
      <SessionProvider>
        <IntlProvider locale={locale} messages={messages}>
          {children}
          <Toaster />
        </IntlProvider>
      </SessionProvider>
    </div>
  );
}
