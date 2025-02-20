"use client";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import React, { ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";

interface Props {
  children: ReactNode;
  locale: string;
  messages: AbstractIntlMessages;
}
export default function IntlProvider({ children, locale, messages }: Props) {
  const methods = useForm();
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <FormProvider {...methods}>{children}</FormProvider>
    </NextIntlClientProvider>
  );
}
