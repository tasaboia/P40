"use client";
import { useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@p40/components/ui/card";
import { Button } from "@p40/components/ui/button";

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
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-indigo-50 to-blue-50 p-4">
        <Card className="w-full max-w-md shadow-lg bg-white rounded-xl overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <div className="w-20 h-20 relative mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-4 border-blue-100 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-1 rounded-full border-4 border-indigo-100 border-t-transparent border-r-transparent border-b-indigo-500 border-l-transparent"
              />
            </div>
            <p className="text-lg font-medium text-center text-gray-700">Redirecionando para o check-in...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center bg-gradient-to-b from-indigo-50 to-blue-50 ">
      
      <Card className="w-full max-w-md shadow-xl bg-white rounded-xl overflow-hidden">
        <div className="h-3 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
        
        <CardHeader className="text-center pb-2 pt-6">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
            Bem-vindo ao Check-in
          </CardTitle>
          <p className="text-muted-foreground mt-2 text-sm">
            Entre para confirmar sua presença
          </p>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-4 mb-2">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <p className="text-sm text-blue-800 font-medium mb-2">✨ Só precisará fazer isso uma vez!</p>
              <p className="text-xs text-blue-700">
                O cadastro é rápido e você não precisará repetir 
                esse processo nas próximas vezes que fizer check-in.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-3 mt-4">
              <div className="flex items-center p-3 rounded-lg bg-gray-50">
                <div className="flex items-center justify-center bg-indigo-100 rounded-full w-8 h-8 mr-3 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-gray-700">Registre sua presença em eventos</span>
              </div>
              
              <div className="flex items-center p-3 rounded-lg bg-gray-50">
                <div className="flex items-center justify-center bg-indigo-100 rounded-full w-8 h-8 mr-3 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-gray-700">Acompanhe seu histórico de check-ins</span>
              </div>
               
            </div>
          </div>
        </CardContent>

        <CardFooter className="px-6 pb-8">
          <Button
            onClick={handleGoogleLogin}
            className="w-full h-12 text-base font-medium bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm transition-all hover:shadow"
          >
            <div className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 mr-3">
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

      <div className="mt-6 text-sm text-center text-gray-500 max-w-md">
        <p>Ao continuar, você concorda com nossa política de privacidade.</p>
      </div>
    </div>
  );
}
