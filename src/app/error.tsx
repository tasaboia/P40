"use client";

import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@p40/components/ui/card";
import { Button } from "@p40/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();
  const t = useTranslations("errors");

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <CardTitle className="text-2xl text-red-600">
            {t("general.title")}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {t("general.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-sm text-gray-700">
            {error?.message || t("general.unknown")}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/")}>
              {t("not_found.home_button")}
            </Button>
            <Button onClick={reset}>{t("not_found.home_button")}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
