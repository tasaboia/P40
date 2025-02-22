"use client";

import { useLocale, useTranslations } from "next-intl";
import { cn } from "@p40/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { useActionState, useState } from "react";
import { loginAction } from "@p40/services/actions/auth";

import { redirect } from "@p40/i18n/routing";
import { useSettingStore } from "@p40/common/states/zion";
import { Checkbox } from "@p40/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import GoogleLogin from "./google-login";
import { useSession } from "next-auth/react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const locale = useLocale();
  const t = useTranslations("login");
  const [state, formAction, isPending] = useActionState(loginAction, {
    error: true,
  });
  const { selectedZion } = useSettingStore();
  const [showPassword, setShowPassword] = useState(false);
  const { data: session } = useSession();

  if (!state.error) {
    if (session?.user?.role === "ADMIN") {
      redirect({
        href: "dashboard",
        locale,
      });
    } else {
      redirect({
        href: "schedule",
        locale,
      });
    }
  }

  return (
    <div className={cn("flex  flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center ">
          <CardTitle className="text-xl">{t("title")}</CardTitle>
          <CardDescription>{t("login_with_provider")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 pb-6">
            <div className="flex flex-col gap-4">
              <GoogleLogin />
            </div>
            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
              <span className="relative z-10 bg-background px-2 text-muted-foreground">
                Ou faça login com dados do prover
              </span>
            </div>
          </div>

          <form action={formAction}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <input type="hidden" name="zionId" value={selectedZion?.id} />

                <div className="grid gap-2">
                  <Label htmlFor="email">{t("email")}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="text"
                    placeholder={t("email_placeholder")}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">{t("password")}</Label>
                    <Link
                      target="_blank"
                      href="https://zion.prover.app/#/home-custom"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      {t("forgot_password")}
                    </Link>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                  />
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-password-checkbox"
                      checked={showPassword}
                      onCheckedChange={() => setShowPassword(!showPassword)}
                    />
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {t("show_password")}
                    </label>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending && <Loader2 className="animate-spin" />}
                  {t("login_button")}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
