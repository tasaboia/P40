"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@p40/components/ui/button";
import { AlertCircle } from "lucide-react";

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
