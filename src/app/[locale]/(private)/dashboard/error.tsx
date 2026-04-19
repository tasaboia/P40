"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@p40/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

const CHUNK_RELOAD_KEY = "p40_chunk_reload_attempts";
const MAX_CHUNK_RELOADS = 2;
const CHUNK_RETRY_PARAM = "__chunk_retry";
const CHUNK_RELOAD_TS_PARAM = "_chunkTs";

type ChunkTelemetryPayload = {
  source: "dashboard-error";
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

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const t = useTranslations("errors");
  const [isChunkError, setIsChunkError] = useState(false);

  useEffect(() => {
    const handleChunkError = async () => {
      console.error("Erro no dashboard:", error);

      if (error?.name === "ChunkLoadError") {
        setIsChunkError(true);

        const currentAttempts = Number(
          sessionStorage.getItem(CHUNK_RELOAD_KEY) || "0",
        );

        await sendChunkTelemetry({
          source: "dashboard-error",
          name: error.name,
          message: error.message,
          stack: error.stack,
          digest: error.digest,
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
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center space-y-6">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <h1 className="text-2xl font-bold text-destructive">
          {t("chunk_error.title")}
        </h1>
        <p className="text-muted-foreground max-w-md">
          {t("chunk_error.description")}
        </p>
        <Button variant="default" onClick={() => window.location.reload()}>
          {t("chunk_error.reload_button")}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center space-y-6">
      <AlertCircle className="h-10 w-10 text-destructive" />
      <h1 className="text-2xl font-bold text-destructive">
        {t("general.title")}
      </h1>
      <p className="text-muted-foreground max-w-md">
        {t("general.description")}
      </p>
      <div className="flex items-center gap-4">
        <Button variant="default" onClick={reset}>
          {t("general.retry_button")}
        </Button>
        <Button variant="outline" onClick={() => router.push("schedule")}>
          {t("general.home_button")}
        </Button>
      </div>
    </div>
  );
}
