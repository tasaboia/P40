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
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">{t("email")}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t("email_placeholder")}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">{t("password")}</Label>
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      {t("forgot_password")}
                    </a>
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
              <div className="text-center text-sm">{t("create_account")}</div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
