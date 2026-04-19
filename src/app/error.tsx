"use client";

import { useEffect, useState } from "react";
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
const CHUNK_RETRY_PARAM = "__chunk_retry";
const CHUNK_RELOAD_TS_PARAM = "_chunkTs";

type ChunkTelemetryPayload = {
  source: "global-error";
  name?: string;
  message?: string;
  stack?: string;
  digest?: string;
  href: string;
  userAgent: string;
  buildId?: string;
  attempt: number;
  maxAttempts: number;
  timestamp: string;
};

function getBuildId() {
  return (window as Window & { __NEXT_DATA__?: { buildId?: string } })
    .__NEXT_DATA__?.buildId;
}

async function sendChunkTelemetry(payload: ChunkTelemetryPayload) {
  console.error("[chunk-telemetry]", payload);

  try {
    await fetch("/api/telemetry/chunk-error", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      keepalive: true,
      body: JSON.stringify(payload),
    });
  } catch (telemetryError) {
    console.error("Falha ao enviar telemetry de chunk:", telemetryError);
  }
}

function reloadWithCacheBusting(attempt: number) {
  const url = new URL(window.location.href);
  url.searchParams.set(CHUNK_RETRY_PARAM, String(attempt));
  url.searchParams.set(CHUNK_RELOAD_TS_PARAM, String(Date.now()));
  window.location.replace(url.toString());
}

function clearChunkDebugParams() {
  const url = new URL(window.location.href);
  url.searchParams.delete(CHUNK_RETRY_PARAM);
  url.searchParams.delete(CHUNK_RELOAD_TS_PARAM);
  window.history.replaceState(null, "", url.toString());
}

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
  const [isChunkError, setIsChunkError] = useState(false);

  useEffect(() => {
    const handleChunkError = async () => {
      if (error?.name === "ChunkLoadError") {
        setIsChunkError(true);

        const currentAttempts = Number(
          sessionStorage.getItem(CHUNK_RELOAD_KEY) || "0",
        );

        await sendChunkTelemetry({
          source: "global-error",
          name: error.name,
          message: error.message,
          stack: error.stack,
          href: window.location.href,
          userAgent: window.navigator.userAgent,
          buildId: getBuildId(),
          attempt: currentAttempts,
          maxAttempts: MAX_CHUNK_RELOADS,
          timestamp: new Date().toISOString(),
        });

        if (shouldReloadChunkError()) {
          reloadWithCacheBusting(currentAttempts + 1);
          return;
        }

        clearChunkDebugParams();
        return;
      }

      sessionStorage.removeItem(CHUNK_RELOAD_KEY);
      clearChunkDebugParams();
    };

    void handleChunkError();
  }, [error]);

  if (isChunkError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            <CardTitle className="text-2xl text-red-600">
              {t("chunk_error.title")}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {t("chunk_error.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Button onClick={() => window.location.reload()}>
              {t("chunk_error.reload_button")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              {t("general.home_button")}
            </Button>
            <Button onClick={reset}>{t("general.retry_button")}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
