"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useActionState } from "react";
import { appConfigAction } from "@p40/services/actions/app-config";
import { Button } from "@p40/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@p40/components/ui/card";
import { Input } from "@p40/components/ui/input";
import { Label } from "@p40/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@p40/components/ui/select";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ConfigEventOnboarding({ event, church }) {
  const t = useTranslations("admin.onboarding");
  const router = useRouter();

  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      eventId: event?.id,
      churchId: church?.id,
      startDate: "",
      endDate: "",
      type: "",
      maxParticipantsPerTurn: "",
      shiftDuration: "",
    },
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const [state, formAction, isPending] = useActionState(appConfigAction, {});

  const onSubmit = async (data) => {
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
      valid = await trigger([
        "type",
        "maxParticipantsPerTurn",
        "shiftDuration",
      ]);
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
          <div className="space-y-4 text-center">
            <p className="text-xl font-bold">{t("welcomeTitle")}</p>
            <p className="text-sm text-gray-600">{t("welcomeDescription")}</p>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="startDate">{t("startDateLabel")}</Label>
              <Controller
                name="startDate"
                control={control}
                rules={{ required: t("startDateHelp") }}
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
              <Label htmlFor="endDate">{t("endDateLabel")}</Label>
              <Controller
                name="endDate"
                control={control}
                rules={{ required: t("endDateHelp") }}
                render={({ field }) => (
                  <Input
                    id="endDate"
                    type="date"
                    {...field}
                    placeholder="Selecione"
                  />
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
              <Label htmlFor="type">{t("eventTypeLabel")}</Label>
              <Controller
                name="type"
                control={control}
                rules={{ required: t("eventTypeHelp") }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder={t("eventTypePlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SHIFT">{t("SHIFT")}</SelectItem>
                      <SelectItem value="CLOCK">{t("CLOCK")}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && (
                <small className="text-xs text-red-500">
                  {errors.type.message}
                </small>
              )}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="maxParticipantsPerTurn">
                {t("maxParticipantsLabel")}
              </Label>
              <Controller
                name="maxParticipantsPerTurn"
                control={control}
                rules={{ required: t("maxParticipantsHelp") }}
                render={({ field }) => (
                  <Input
                    id="maxParticipantsPerTurn"
                    type="number"
                    placeholder={t("maxParticipantsPlaceholder")}
                    {...field}
                  />
                )}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="shiftDuration">{t("shiftDurationLabel")}</Label>
              <Controller
                name="shiftDuration"
                control={control}
                rules={{ required: t("shiftDurationHelp") }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="shiftDuration">
                      <SelectValue
                        placeholder={t("shiftDurationPlaceholder")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">{t("oneHour")}</SelectItem>
                      <SelectItem value="30">{t("thirtyMinutes")}</SelectItem>
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
          <CardTitle className="text-lg">{t("configurationTitle")}</CardTitle>
          <CardDescription>{t("configurationDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8">
            <input type="hidden" name="eventId" value={event?.id || ""} />
            <input type="hidden" name="churchId" value={church?.id || ""} />
            {renderStepContent()}
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 1}
              >
                {t("backButton")}
              </Button>
              {currentStep < totalSteps ? (
                <Button type="button" onClick={handleNext}>
                  {t("nextButton")}
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isPending || !isValid}
                  className="flex gap-2"
                >
                  {isPending && <Loader2 className="animate-spin" />}
                  {t("submitButton")}
                </Button>
              )}
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
