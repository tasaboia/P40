import { Badge } from "@p40/components/ui";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import React from "react";

export function RenderShiftStatus({ status }: { status: string }) {
  switch (status) {
    case "empty":
      return (
        <Badge
          variant="outline"
          className="bg-destructive/10 text-destructive border-destructive/20"
        >
          <XCircle className="h-3 w-3 mr-1" />
          Vazio
        </Badge>
      );
    case "partial":
      return (
        <Badge
          variant="outline"
          className="bg-warning/10 text-warning border-warning/20"
        >
          <AlertCircle className="h-3 w-3 mr-1" />
          Parcial
        </Badge>
      );
    case "full":
      return (
        <Badge
          variant="outline"
          className="bg-success/10 text-success border-success/20"
        >
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Completo
        </Badge>
      );
    default:
      return null;
  }
}
