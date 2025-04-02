"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import * as UI from "@p40/components/ui/index";
import { useOnboarding } from "@p40/common/context/onboarding-context";
import GoogleLogin from "./login-google";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { toast } from "@p40/hooks/use-toast";

export default function Login() {
  const router = useRouter();
  const t = useTranslations("auth.login");
  const { onboardingData, resetOnboarding, isOnboardingComplete } = useOnboarding();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Verificar onboarding
  if (!onboardingData.location.id) {
    router.push("leaders-onboarding");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const zionId = onboardingData.location.id;

      // Validação dos campos
      if (!email || !password || !zionId) {
        toast({
          title: "Erro",
          description: "Preencha todos os campos corretamente",
          variant: "destructive",
        });
        return;
      }

      const areas = Array.isArray(onboardingData.areas) ? onboardingData.areas : [];
//aqui esta com os dados corretos 
      const result = await signIn("credentials", {
        username: email,
        password: password,
        zionId: zionId,
        serviceAreas: JSON.stringify(areas),
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: "Erro",
          description: 'Usuário e/ou Senha inválido(s).',
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Login realizado com sucesso",
        description: "Redirecionando...",
      });

      router.push("/schedule");
      
    } catch (error) {
      console.error("Erro no processo de login:", error);
      toast({
        title: "Erro no login",
        description: error instanceof Error 
          ? error.message 
          : "Ocorreu um erro ao fazer login. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetOnboarding = () => {
    resetOnboarding();
    router.push("leaders-onboarding");
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-5 bg-background pb-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-2"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Entrar</h1>
          <p className="text-muted-foreground">
            Acesse sua conta do 40 Dias de Oração
          </p>
        </div>

        {isOnboardingComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 pt-4 border-t border-border/30"
          >
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <div>
                <span>{onboardingData.location.name || ""}</span>
                {onboardingData.areas.length > 0 && (
                  <span className="ml-2">
                    • {onboardingData.areas.length} área
                    {onboardingData.areas.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <UI.Button
                variant="link"
                size="sm"
                className="h-6 p-0 text-xs text-muted-foreground hover:text-primary"
                onClick={handleResetOnboarding}
              >
                Alterar configurações
                <ChevronRight className="h-3 w-3 ml-1" />
              </UI.Button>
            </div>
          </motion.div>
        )}

        <div className="grid gap-6 pb-6">
          <div className="flex flex-col gap-4">
            <GoogleLogin />
          </div>
          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              {t("or_login_with_prover")}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <UI.Label htmlFor="email">{t("email")}</UI.Label>
            <UI.Input
              id="email"
              name="email"
              placeholder={t("email_placeholder")}
              required
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <UI.Label htmlFor="password">{t("password")}</UI.Label>
              <Link
                href="https://zion.prover.app/#/home-custom"
                target="_blank"
                className="text-sm text-muted-foreground hover:underline"
              >
                {t("forgot_password")}
              </Link>
            </div>
            <UI.Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              disabled={isLoading}
            />
            <div className="flex items-center space-x-2">
              <UI.Checkbox
                id="show-password"
                checked={showPassword}
                onCheckedChange={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              />
              <label htmlFor="show-password" className="text-sm">
                {t("show_password")}
              </label>
            </div>
          </div>

          <UI.Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-primary" />
                Entrando...
              </>
            ) : (
              t("login_button")
            )}
          </UI.Button>
        </form>
      </motion.div>
    </div>
  );
}
