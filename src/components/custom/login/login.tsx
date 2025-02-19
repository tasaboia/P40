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
import { useFormStatus } from "react-dom";
import { redirect } from "@p40/i18n/routing";
import { useSettingStore } from "@p40/common/states/zion";
import { Checkbox } from "@p40/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const locale = useLocale();
  const t = useTranslations("login");
  const [state, formAction, isPending] = useActionState(loginAction, {
    error: true,
  });
  const { pending } = useFormStatus();
  const { selectedZion } = useSettingStore();
  const [showPassword, setShowPassword] = useState(false);

  if (!state.error)
    return redirect({
      href: "schedule",
      locale,
    });

  return (
    <div className={cn("flex  flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center ">
          <CardTitle className="text-xl">{t("title")}</CardTitle>
          <CardDescription>{t("login_with_provider")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={(e) => {
              e.append("zionId", selectedZion?.id);
              formAction(e);
            }}
          >
            <div className="grid gap-6">
              {/* <div className="flex flex-col gap-4">
                <Button variant="outline" className="w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Login com o Google
                </Button>
              </div>
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  ou
                </span>
              </div> */}
              <div className="grid gap-6">
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
