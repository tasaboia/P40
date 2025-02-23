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
  const t = await getTranslations("not_found");

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">{t("message")}</p>
        </CardContent>
        <div className="p-4 flex justify-end">
          <Link href="welcome">
            <Button>{t("homeButton")}</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
