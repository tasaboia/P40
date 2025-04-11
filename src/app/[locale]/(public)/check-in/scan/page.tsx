"use client";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@p40/components/ui/card";
import { QrCode, Smartphone } from "lucide-react";

export default function ScanQRCode() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-sm border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-center">
            Escaneie o QR Code do Evento
          </CardTitle>
          <CardDescription className="text-center">
            Use a câmera do seu dispositivo para escanear o QR code do evento
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="relative h-64 w-64 mb-6 border-2 border-dashed border-primary/20 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Smartphone className="h-24 w-24 text-primary/60 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                Abra a câmera do seu dispositivo e aponte para o QR code
              </p>
            </div>
          </div>

          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              Após escanear o QR code, você será redirecionado automaticamente para a página de check-in
            </p>
            <p className="text-xs text-muted-foreground">
              Se você já escaneou o QR code e não foi redirecionado, tente novamente
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 