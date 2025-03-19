import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@p40/components/ui/card";
import { Button } from "@p40/components/ui/button";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("errors");

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {t("not_found.title")}
          </CardTitle>
          <CardDescription>{t("not_found.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">{t("not_found.message")}</p>
        </CardContent>
        <div className="p-4 flex justify-end">
          <Link href="welcome">
            <Button>{t("not_found.home_button")}</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
