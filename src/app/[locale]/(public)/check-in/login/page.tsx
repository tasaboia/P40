"use client";
import { useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@p40/components/ui/card";
import { Button } from "@p40/components/ui/button";
import { CheckCircle, Clock } from "lucide-react";

export default function GoogleLogin() {
  const session = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  
  // Redirecionar para a página de check-in se já estiver autenticado
  useEffect(() => {
    if (session.status === "authenticated") {
      const callbackUrl = eventId 
        ? `/check-in/onboarding?eventId=${eventId}` 
        : "/check-in/onboarding";
      
      router.push(callbackUrl);
    }
  }, [session.status, router, eventId]);

  const handleGoogleLogin = async () => {
    // Configurar o callbackUrl para incluir o eventId
    const callbackUrl = eventId 
      ? `/check-in/onboarding/?eventId=${eventId}` 
      : "/check-in/onboarding";
      
    await signIn("google", { callbackUrl });
  };

  if (session.status === "authenticated") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md shadow-sm border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-center">Aguarde um momento</CardTitle>
            <CardDescription className="text-center">Estamos preparando seu check-in</CardDescription>
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
              Redirecionando para o check-in...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
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
              <p className="text-sm font-medium text-primary mb-1">✨ Processo simplificado</p>
              <p className="text-xs text-foreground/80">
                Após o primeiro acesso, seus dados serão salvos para facilitar check-ins futuros.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-3 mt-2">
              <div className="flex items-center p-3 rounded-lg bg-background border border-border">
                <div className="flex items-center justify-center rounded-full w-8 h-8 mr-3 bg-primary/10">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm">Registre sua presença com um clique</span>
              </div>
              
              <div className="flex items-center p-3 rounded-lg bg-background border border-border">
                <div className="flex items-center justify-center rounded-full w-8 h-8 mr-3 bg-primary/10">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm">Acompanhe seu histórico de presenças</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="px-6 pt-2 pb-6">
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full h-10 border border-input bg-background hover:bg-accent"
            >
              <div className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 mr-2">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="#4285F4"
                  />
                </svg>
                <span>Entrar com Google</span>
              </div>
            </Button>
          </CardFooter>
        </Card>

        <div className="text-center text-xs text-muted-foreground max-w-xs mx-auto">
          <p>Ao continuar, você concorda com nossa política de privacidade e termos de uso.</p>
        </div>
      </div>
    </div>
  );
}
