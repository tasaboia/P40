"use client";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import React, { ReactNode } from "react";

interface Props {
  children: ReactNode;
  locale: string;
  messages: AbstractIntlMessages;
}
export default function IntlProvider({ children, locale, messages }: Props) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
