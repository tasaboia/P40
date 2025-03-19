"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { Label } from "@p40/components/ui/label";
import { Input } from "@p40/components/ui/input";
import { Button } from "@p40/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@p40/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@p40/components/ui/select";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { appConfigAction } from "@p40/services/actions/app-config";
import { Loader2 } from "lucide-react";
import { ErrorHandler } from "@p40/components/custom/error-handler";
import { User } from "@p40/common/contracts/user/user";

interface ConfigEventOnboardingProps {
  user: User | null;
  church: string | undefined;
}

export default function ConfigEventOnboarding({
  user,
  church,
}: ConfigEventOnboardingProps) {
  console.log("ConfigEvent - Props:", { user, church });

  const t = useTranslations("admin.onboarding");
  const router = useRouter();

  // Inicializar os hooks primeiro, antes de qualquer retorno condicional
  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      eventId: "", // Novo evento, sem ID
      churchId: church || "",
      startDate: "",
      endDate: "",
      eventType: "",
      maxParticipants: "",
      shiftDuration: "",
    },
  });

  // Inicializar state hooks
  const [currentStep, setCurrentStep] = React.useState(1);
  const totalSteps = 3;

  const [state, formAction, isPending] = useActionState(appConfigAction, {});

  // Se não tiver usuário ou igreja, mostrar erro
  if (!user || !church) {
    console.error("ConfigEvent - Usuário ou igreja não encontrados", {
      user,
      church,
    });
    return (
      <ErrorHandler
        error={{
          title: "Dados incompletos",
          description:
            "Não foi possível carregar os dados do usuário ou da igreja",
        }}
      />
    );
  }

  const onSubmit = async (data: any) => {
    try {
      await formAction(data);
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const handleNext = async () => {
    let valid = false;
    if (currentStep === 1) {
      valid = await trigger(["startDate", "endDate"]);
    } else if (currentStep === 2) {
      valid = await trigger(["eventType", "maxParticipants", "shiftDuration"]);
    }
    if (valid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold tracking-tight">
              {t("welcome.title")}
            </h2>
            <p className="text-muted-foreground">{t("welcome.description")}</p>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="startDate">{t("form.dates.start.label")}</Label>
              <Controller
                name="startDate"
                control={control}
                rules={{ required: t("form.dates.start.help") }}
                render={({ field }) => (
                  <Input id="startDate" type="date" {...field} />
                )}
              />
              {errors.startDate && (
                <small className="text-xs text-red-500">
                  {errors.startDate.message}
                </small>
              )}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="endDate">{t("form.dates.end.label")}</Label>
              <Controller
                name="endDate"
                control={control}
                rules={{ required: t("form.dates.end.help") }}
                render={({ field }) => (
                  <Input id="endDate" type="date" {...field} />
                )}
              />
              {errors.endDate && (
                <small className="text-xs text-red-500">
                  {errors.endDate.message}
                </small>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="eventType">{t("form.eventType.label")}</Label>
              <Controller
                name="eventType"
                control={control}
                rules={{ required: t("form.eventType.help") }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="eventType">
                      <SelectValue
                        placeholder={t("form.eventType.placeholder")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SHIFT">
                        {t("form.eventType.options.SHIFT")}
                      </SelectItem>
                      <SelectItem value="CLOCK">
                        {t("form.eventType.options.CLOCK")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.eventType && (
                <small className="text-xs text-red-500">
                  {errors.eventType.message}
                </small>
              )}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="maxParticipants">
                {t("form.maxParticipants.label")}
              </Label>
              <Controller
                name="maxParticipants"
                control={control}
                rules={{ required: t("form.maxParticipants.help") }}
                render={({ field }) => (
                  <Input
                    id="maxParticipants"
                    type="number"
                    placeholder={t("form.maxParticipants.placeholder")}
                    {...field}
                  />
                )}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="shiftDuration">
                {t("form.shiftDuration.label")}
              </Label>
              <Controller
                name="shiftDuration"
                control={control}
                rules={{ required: t("form.shiftDuration.help") }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="shiftDuration">
                      <SelectValue
                        placeholder={t("form.shiftDuration.placeholder")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">
                        {t("form.shiftDuration.options.oneHour")}
                      </SelectItem>
                      <SelectItem value="30">
                        {t("form.shiftDuration.options.thirtyMinutes")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.shiftDuration && (
                <small className="text-xs text-red-500">
                  {errors.shiftDuration.message}
                </small>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-muted h-full flex justify-center items-center">
      <Card className="w-[350px] mx-auto">
        <CardHeader>
          <CardTitle className="text-lg">{t("welcome.title")}</CardTitle>
          <CardDescription>{t("welcome.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8">
            <input type="hidden" name="eventId" value={""} />
            <input type="hidden" name="churchId" value={church || ""} />
            {renderStepContent()}
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 1}
              >
                {t("actions.back")}
              </Button>
              {currentStep < totalSteps ? (
                <Button type="button" onClick={handleNext}>
                  {t("actions.next")}
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isPending || !isValid}
                  className="flex gap-2"
                >
                  {isPending && <Loader2 className="animate-spin" />}
                  {t("actions.submit")}
                </Button>
              )}
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
