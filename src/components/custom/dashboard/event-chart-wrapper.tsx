"use client";

import { NextIntlClientProvider } from "next-intl";
import { EventChart } from "./event-chart";

interface EventChartWrapperProps {
  chartData: {
    day: number;
    people: number;
    emptySlots: number;
  }[];
  messages: any;
  locale: string;
}

export function EventChartWrapper({
  chartData,
  messages,
  locale,
}: EventChartWrapperProps) {
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <EventChart chartData={chartData} />
    </NextIntlClientProvider>
  );
}
