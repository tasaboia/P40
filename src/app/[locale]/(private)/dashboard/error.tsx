"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@p40/components/ui/button";
import { AlertCircle } from "lucide-react";

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

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("Erro no dashboard:", error);
    if (error?.name === "ChunkLoadError") {
      if (shouldReloadChunkError()) {
        window.location.reload();
      }
      return;
    }

    sessionStorage.removeItem(CHUNK_RELOAD_KEY);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center space-y-6">
      <AlertCircle className="h-10 w-10 text-destructive" />
      <h1 className="text-2xl font-bold text-destructive">
        Erro ao carregar o dashboard
      </h1>
      <p className="text-muted-foreground max-w-md">
        Ocorreu um erro inesperado. Tente novamente ou entre em contato com o
        suporte.
      </p>
      <div className="flex items-center gap-4">
        <Button variant="default" onClick={reset}>
          Tentar novamente
        </Button>
        <Button variant="outline" onClick={() => router.push("schedule")}>
          Voltar para o início
        </Button>
      </div>
    </div>
  );
}
