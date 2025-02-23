"use client";

import React, { useState } from "react";
import { useActionState } from "react";
import { use } from "react";
import { AppResponse } from "@p40/common/contracts/config/config";
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

export default function ConfigEventOnboarding({ event, church }) {
  const [formState, setFormState] = useState({
    startDate: "",
    endDate: "",
    type: "",
    maxParticipantsPerTurn: "",
    shiftDuration: "",
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const [_, formAction, isPending] = useActionState(appConfigAction, {});

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Função para voltar ao passo anterior
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
            <p className="text-xl font-bold">
              Bem-vindo(a) ao 40 Dias de Oração!
            </p>
            <p className="text-sm text-gray-600">
              Estamos muito felizes por tê-lo(a) conosco. Neste processo de
              configuração, você definirá os detalhes dos 40 dias da sua igreja
              local e personalizará a forma como os turnos de oração serão
              organizados para os líderes.
            </p>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="startDate">Data de Início</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formState.startDate}
                onChange={handleChange}
              />
              <small className="text-xs text-gray-400">
                Escolha a data de início do evento.
              </small>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="endDate">Data de Término</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formState.endDate}
                onChange={handleChange}
              />
              <small className="text-xs text-gray-400">
                Escolha a data de término do evento.
              </small>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="type">Tipo do Evento</Label>
              <Select
                onValueChange={(value) =>
                  setFormState((prev) => ({ ...prev, type: value }))
                }
                value={formState.type}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SHIFT">Turnos de Oração</SelectItem>
                  <SelectItem value="CLOCK">Relógio de Oração</SelectItem>
                </SelectContent>
              </Select>
              <small className="text-xs text-gray-400">
                Escolha como os turnos serão organizados.
              </small>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="maxParticipantsPerTurn">
                Máximo de Participantes por Turno
              </Label>
              <Input
                id="maxParticipantsPerTurn"
                name="maxParticipantsPerTurn"
                type="number"
                placeholder="Ex: 2"
                value={formState.maxParticipantsPerTurn}
                onChange={handleChange}
              />
              <small className="text-xs text-gray-400">
                Defina quantos participantes podem estar em um turno.
              </small>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="shiftDuration">Duração do Turno</Label>
              <Select
                onValueChange={(value) =>
                  setFormState((prev) => ({ ...prev, shiftDuration: value }))
                }
                value={formState.shiftDuration}
              >
                <SelectTrigger id="shiftDuration">
                  <SelectValue placeholder="Selecione a duração" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                </SelectContent>
              </Select>
              <small className="text-xs text-gray-400">
                Informe quanto tempo cada turno deverá durar.
              </small>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-[350px] mx-auto">
      <CardHeader>
        <CardTitle className="text-lg">
          {currentStep === 1 ? "" : "Configuração do Evento"}
        </CardTitle>
        <CardDescription>
          {currentStep === 1
            ? ""
            : "Preencha os campos abaixo para configurar seu evento."}
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
              Voltar
            </Button>
            {currentStep < totalSteps ? (
              <Button type="button" onClick={handleNext}>
                Avançar
              </Button>
            ) : (
              <Button type="submit" disabled={isPending}>
                Salvar e Iniciar
              </Button>
            )}
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
