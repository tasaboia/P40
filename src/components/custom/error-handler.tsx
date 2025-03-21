"use client";

import { useEffect } from "react";
import { toast } from "@p40/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@p40/components/ui/alert";

interface ErrorHandlerProps {
  error?: {
    title: string;
    description: string;
  } | null;
  title?: string;
  message?: string;
  showToast?: boolean;
}

export function ErrorHandler({
  error,
  title,
  message,
  showToast = false,
}: ErrorHandlerProps) {
  useEffect(() => {
    if (error && showToast) {
      toast({
        variant: "destructive",
        title: error.title,
        description: error.description,
      });
    }
  }, [error, showToast]);

  // Se tiver título e mensagem diretos, exibe um alerta visual
  if (title && message) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    );
  }

  // Se receber apenas o objeto error, mas não quiser exibir toast, mostra um alerta visual
  if (error && !showToast) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{error.title}</AlertTitle>
        <AlertDescription>{error.description}</AlertDescription>
      </Alert>
    );
  }

  // Caso contrário (exibiu toast ou não tem dados), não renderiza nada
  return null;
}
