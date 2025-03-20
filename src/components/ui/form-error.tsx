import { AlertTriangle } from "lucide-react";

interface FormErrorProps {
  message?: string;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <div className="flex items-center gap-2 text-destructive text-sm mt-2">
      <AlertTriangle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  );
}
