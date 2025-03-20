"use client";

import type React from "react";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight, Loader2 } from "lucide-react";
import * as UI from "@p40/components/ui/index";
import { useOnboarding } from "@p40/common/context/onboarding-context";
import GoogleLogin from "./login-google";
import { loginAction } from "@p40/services/actions/auth";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const t = useTranslations("auth.login");

  const { onboardingData, resetOnboarding, isOnboardingComplete } =
    useOnboarding();
  const [state, formAction, isPending] = useActionState(loginAction, {
    error: true,
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!state.error) router.refresh();
  }, [state]);

  useEffect(() => {
    if (!onboardingData.location.id || onboardingData.areas.length === 0) {
      router.push("leaders-onboarding");
    }
  }, [onboardingData, router]);

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
                <span>{onboardingData.location.name}</span>
                {onboardingData.areas.length > 0 && (
                  <span className="ml-2">
                    • {onboardingData.areas.length} área
                    {onboardingData.areas.length !== 1 ? "s" : ""}
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

        <form action={formAction}>
          <div className="grid gap-6">
            <div className="grid gap-6">
              <div className="grid gap-2">
                <UI.Label htmlFor="email">{t("email")}</UI.Label>
                <UI.Input
                  id="email"
                  name="email"
                  type="text"
                  placeholder={t("email_placeholder")}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <UI.Label htmlFor="password">{t("password")}</UI.Label>
                  <Link
                    target="_blank"
                    href="https://zion.prover.app/#/home-custom"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    {t("forgot_password")}
                  </Link>
                </div>
                <UI.Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                />
                <div className="flex items-center space-x-2">
                  <UI.Checkbox
                    id="show-password-checkbox"
                    checked={showPassword}
                    onCheckedChange={() => setShowPassword(!showPassword)}
                  />
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {t("show_password")}
                  </label>
                </div>
              </div>
              <UI.Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Loader2 className="animate-spin" />}
                {t("login_button")}
              </UI.Button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
