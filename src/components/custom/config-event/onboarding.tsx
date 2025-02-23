"use client";

import React, { useEffect, useState } from "react";
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
import { useRouter } from "next/navigation";

export default function ConfigEventOnboarding({ event, church }) {
  const t = useTranslations("admin.onboarding");
  const [formState, setFormState] = useState({
    startDate: "",
    endDate: "",
    type: "",
    maxParticipantsPerTurn: "",
    shiftDuration: "",
  });

  const route = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const [state, formAction, isPending] = useActionState(appConfigAction, {});

  useEffect(() => {
    if (!state.error) {
      route.refresh();
    }
  }, [state]);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
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
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formState.startDate}
                onChange={handleChange}
              />
              <small className="text-xs text-gray-400">
                {t("startDateHelp")}
              </small>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="endDate">{t("endDateLabel")}</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formState.endDate}
                onChange={handleChange}
              />
              <small className="text-xs text-gray-400">
                {t("endDateHelp")}
              </small>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="type">{t("eventTypeLabel")}</Label>
              <Select
                onValueChange={(value) =>
                  setFormState((prev) => ({ ...prev, type: value }))
                }
                value={formState.type}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder={t("eventTypePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SHIFT">{t("SHIFT")}</SelectItem>
                  <SelectItem value="CLOCK">{t("CLOCK")}</SelectItem>
                </SelectContent>
              </Select>
              <small className="text-xs text-gray-400">
                {t("eventTypeHelp")}
              </small>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="maxParticipantsPerTurn">
                {t("maxParticipantsLabel")}
              </Label>
              <Input
                id="maxParticipantsPerTurn"
                name="maxParticipantsPerTurn"
                type="number"
                placeholder={t("maxParticipantsPlaceholder")}
                value={formState.maxParticipantsPerTurn}
                onChange={handleChange}
              />
              <small className="text-xs text-gray-400">
                {t("maxParticipantsHelp")}
              </small>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="shiftDuration">{t("shiftDurationLabel")}</Label>
              <Select
                onValueChange={(value) =>
                  setFormState((prev) => ({ ...prev, shiftDuration: value }))
                }
                value={formState.shiftDuration}
              >
                <SelectTrigger id="shiftDuration">
                  <SelectValue placeholder={t("shiftDurationPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="60">{t("oneHour")}</SelectItem>
                  <SelectItem value="30">{t("thirtyMinutes")}</SelectItem>
                </SelectContent>
              </Select>
              <small className="text-xs text-gray-400">
                {t("shiftDurationHelp")}
              </small>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-muted h-full flex justify-center items-center">
      <Card className="w-[350px] mx-auto ">
        <CardHeader>
          <CardTitle className="text-lg">
            {currentStep === 1 ? "" : t("configurationTitle")}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 ? "" : t("configurationDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="grid gap-8">
            <input type="hidden" name="eventId" value={event?.id || ""} />
            <input type="hidden" name="churchId" value={church?.id || ""} />

            {renderStepContent()}

            {currentStep === totalSteps && (
              <>
                <input
                  type="hidden"
                  name="startDate"
                  value={formState.startDate}
                />
                <input type="hidden" name="endDate" value={formState.endDate} />
                <input type="hidden" name="type" value={formState.type} />
                <input
                  type="hidden"
                  name="maxParticipantsPerTurn"
                  value={formState.maxParticipantsPerTurn}
                />
                <input
                  type="hidden"
                  name="shiftDuration"
                  value={formState.shiftDuration}
                />
              </>
            )}

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
                <Button type="submit" disabled={isPending}>
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
