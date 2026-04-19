"use client";

import { useEffect } from "react";
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

const CHUNK_RELOAD_KEY = "p40_chunk_reload_attempts";
const MAX_CHUNK_RELOADS = 2;

function shouldReloadChunkError() {
  const currentAttempts = Number(
    sessionStorage.getItem(CHUNK_RELOAD_KEY) || "0",
  );

  if (currentAttempts >= MAX_CHUNK_RELOADS) {
    sessionStorage.removeItem(CHUNK_RELOAD_KEY);
    return false;
  }

  sessionStorage.setItem(CHUNK_RELOAD_KEY, String(currentAttempts + 1));
  return true;
}

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();
  const t = useTranslations("errors");

  useEffect(() => {
    if (error?.name === "ChunkLoadError") {
      if (shouldReloadChunkError()) {
        window.location.reload();
      }
      return;
    }

    sessionStorage.removeItem(CHUNK_RELOAD_KEY);
  }, [error]);

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
