"use client";

import { useEffect } from "react";
import { toast } from "@p40/hooks/use-toast";

interface ErrorHandlerProps {
  error: {
    title: string;
    description: string;
  } | null;
}

export function ErrorHandler({ error }: ErrorHandlerProps) {
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: error.title,
        description: error.description,
      });
    }
  }, [error]);

  return null;
}
