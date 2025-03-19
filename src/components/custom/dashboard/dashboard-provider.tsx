"use client";

import { NextIntlClientProvider } from "next-intl";
import { ReactNode } from "react";

interface DashboardProviderProps {
  messages: any;
  locale: string;
  children: ReactNode;
}

export function DashboardProvider({
  messages,
  locale,
  children,
}: DashboardProviderProps) {
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}
