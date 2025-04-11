"use client";
import { useEffect, useState, useCallback } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@p40/components/ui/card";
import { Button } from "@p40/components/ui/button";
import { CheckCircle, Clock, Smartphone } from "lucide-react";
import api from "@p40/lib/axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@p40/components/ui/dialog";

export default function GoogleLogin() {
  const session = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!eventId) {
      setShowModal(true);
    }
  }, [eventId]);

  const getChurchByEventId = useCallback(async () => {
    try {
      const response = await api.get(`/api/church?eventId=${eventId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar igreja:", error);
      setError("Não foi possível encontrar o evento. Por favor, tente novamente.");
      return null;
    }
  }, [eventId]);

  const updateUserWithChurch = useCallback(async (churchId: string) => {
    try {
      const response = await api.post("/api/user/update", {
        id: session.data?.user?.id,
        zionId: churchId,
        role: "USER",
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      setError("Não foi possível atualizar seus dados. Por favor, tente novamente.");
      return null;
    }
  }, [session.data?.user?.id]);

  useEffect(()=>{
    if(session.data?.user){
    console.log("dados do usuario",session.data.user)}
  },[session])
  
  const handleLogin = useCallback(async () => {
    if (!eventId || !session.data?.user?.id || isProcessing) return;

    setIsProcessing(true);
    setIsLoading(true);
    setError(null);

    try {
      const church = await getChurchByEventId();
      if (!church) {
        setIsProcessing(false);
        setIsLoading(false);
        return;
      }

      const updatedUser = await updateUserWithChurch(church.id);
      if (!updatedUser) {
        setIsProcessing(false);
        setIsLoading(false);
        return;
      }

      await session.update({
        ...session.data,
        user: {
          ...session.data.user,
          ...updatedUser
        }
      });

      router.push(`/check-in/onboarding?eventId=${eventId}`);
    } catch (error) {
      console.error("Erro no processo de login:", error);
      setError("Ocorreu um erro durante o login. Por favor, tente novamente.");
      setIsProcessing(false);
      setIsLoading(false);
    }
  }, [eventId, session.data, router, getChurchByEventId, updateUserWithChurch, isProcessing]);

  useEffect(() => {
    if (session.status === "authenticated" && eventId && !isProcessing) {
      handleLogin();
    }
  }, [session.status, eventId, handleLogin, isProcessing]);

  const LoadingScreen = () => (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-sm border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-center">
            Aguarde um momento
          </CardTitle>
          <CardDescription className="text-center">
            Estamos preparando seu check-in
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="relative h-16 w-16 mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <Clock className="h-full w-full text-primary/60" />
            </motion.div>
          </div>
          <p className="text-sm text-center text-muted-foreground">
            {error || "Redirecionando para o check-in..."}
          </p>
        </CardContent>
      </Card>
    </div>
  );

  if (session.status === "authenticated" || isProcessing) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Escaneie o QR Code do Evento</DialogTitle>
            <DialogDescription>
              Para continuar, você precisa escanear o QR code do evento com a câmera do seu dispositivo.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative h-48 w-48 mb-6 border-2 border-dashed border-primary/20 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Smartphone className="h-24 w-24 text-primary/60 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  Abra a câmera do seu dispositivo e aponte para o QR code
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Após escanear o QR code, você será redirecionado automaticamente para esta página
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Check-in</h1>
            <p className="text-sm text-muted-foreground">
              Entre para confirmar sua presença
            </p>
          </div>

          <Card className="w-full shadow-sm border-border">
            <CardHeader className="pb-4 space-y-1">
              <div className="h-1 w-full bg-primary/20 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-primary rounded-full"></div>
              </div>
              <CardDescription className="text-center pt-2">
                Confirme sua presença de forma simples e rápida
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-lg p-4 bg-primary/5 border border-primary/10">
                <p className="text-sm font-medium text-primary mb-1">
                  ✨ Processo simplificado
                </p>
                <p className="text-xs text-foreground/80">
                  Após o primeiro acesso, seus dados serão salvos para facilitar
                  check-ins futuros.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 mt-2">
                <div className="flex items-center p-3 rounded-lg bg-background border border-border">
                  <div className="flex items-center justify-center rounded-full w-8 h-8 mr-3 bg-primary/10">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm">
                    Registre sua presença com um clique
                  </span>
                </div>

                <div className="flex items-center p-3 rounded-lg bg-background border border-border">
                  <div className="flex items-center justify-center rounded-full w-8 h-8 mr-3 bg-primary/10">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm">
                    Acompanhe seu histórico de presenças
                  </span>
                </div>
              </div>
            </CardContent>

            {eventId && (
              <CardFooter className="px-6 pt-2 pb-6">
                <Button
                  onClick={async () => await signIn("google")}
                  variant="outline"
                  className="w-full h-10 border border-input bg-background hover:bg-accent"
                  disabled={isLoading}
                >
                  <div className="flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="h-4 w-4 mr-2"
                    >
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="#4285F4"
                      />
                    </svg>
                    <span>{isLoading ? "Carregando..." : "Entrar com Google"}</span>
                  </div>
                </Button>
              </CardFooter>
            )}
          </Card>

          <div className="text-center text-xs text-muted-foreground max-w-xs mx-auto">
            <p>
              Ao continuar, você concorda com nossa política de privacidade e
              termos de uso.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
