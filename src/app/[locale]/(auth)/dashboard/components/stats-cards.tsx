"use client";
import React, { useState } from "react";

import { ArrowUpRight, MessageSquareQuote } from "lucide-react";
import { format } from "date-fns";
import { RenderShiftStatus } from "./render-shift-status";
import { useDashboard } from "@p40/common/context/dashboard-context";
import { Weekday } from "@p40/common/contracts/week/schedule";
import * as UI from "@p40/components/ui/index";
import { Helpers } from "@p40/common/utils/helpers";
import RecommendedShiftsCard from "./recommended-shifts-card";

interface StatsCardsProps {
  setShowSingleLeaderShifts: (value: boolean) => void;
}
export default function StatsCards({
  setShowSingleLeaderShifts,
}: StatsCardsProps) {
  const { stats, setActiveTab, getRecommendedShifts, testimonies } =
    useDashboard();

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <UI.Card>
          <UI.CardHeader className="pb-2">
            <UI.CardTitle className="text-sm font-medium text-muted-foreground">
              Líderes Inscritos
            </UI.CardTitle>
          </UI.CardHeader>
          <UI.CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold">
                {stats?.totalLeaders || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Meta mínima: {stats.totalPrayerTurns}
              </div>
            </div>
            <UI.Progress
              value={Math.round(
                ((stats?.totalLeaders || 0) / (stats?.totalPrayerTurns || 1)) *
                  100
              )}
              className="h-2 mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round(
                ((stats?.totalLeaders || 0) / (stats?.totalPrayerTurns || 1)) *
                  100
              ) ?? 0}
              % da meta atingida
            </p>
          </UI.CardContent>
        </UI.Card>

        <UI.Card>
          <UI.CardHeader className="pb-2">
            <UI.CardTitle className="text-sm font-medium text-muted-foreground">
              Horários Preenchidos
            </UI.CardTitle>
          </UI.CardHeader>
          <UI.CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold">
                {stats?.filledPrayerTurns || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Total: {stats?.totalPrayerTurns || 0}
              </div>
            </div>
            <UI.Progress value={stats.shiftsPercentage} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round(
                ((stats?.filledPrayerTurns || 0) /
                  (stats?.totalPrayerTurns || 1)) *
                  100
              )}
              % dos horários completos
            </p>
          </UI.CardContent>
        </UI.Card>

        <UI.Card>
          <UI.CardHeader className="pb-2">
            <UI.CardTitle className="text-sm font-medium text-muted-foreground">
              Horários com Só Um Líder
            </UI.CardTitle>
          </UI.CardHeader>
          <UI.CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold">
                {stats?.partialPrayerTurns || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Total: {stats?.totalPrayerTurns || 0}
              </div>
            </div>
            <UI.Progress
              value={
                ((stats?.partialPrayerTurns || 0) /
                  (stats?.totalPrayerTurns || 1)) *
                100
              }
              className="h-2 mt-2"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-muted-foreground">
                {Math.round(
                  ((stats?.partialPrayerTurns || 0) /
                    (stats?.totalPrayerTurns || 1)) *
                    100
                )}
                % dos horários
              </p>
              <UI.Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setShowSingleLeaderShifts(true)}
              >
                Ver detalhes
              </UI.Button>
            </div>
          </UI.CardContent>
        </UI.Card>

        <UI.Card>
          <UI.CardHeader className="pb-2">
            <UI.CardTitle className="text-sm font-medium text-muted-foreground">
              Horários Vazios
            </UI.CardTitle>
          </UI.CardHeader>
          <UI.CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold">
                {stats?.emptyPrayerTurns || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Total: {stats?.totalPrayerTurns || 0}
              </div>
            </div>
            <UI.Progress
              value={
                ((stats?.emptyPrayerTurns || 0) /
                  (stats?.totalPrayerTurns || 1)) *
                100
              }
              className="h-2 mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round(
                ((stats?.emptyPrayerTurns || 0) /
                  (stats?.totalPrayerTurns || 1)) *
                  100
              )}
              % dos horários sem líderes
            </p>
          </UI.CardContent>
        </UI.Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <UI.Card className="lg:col-span-2">
          <UI.CardHeader>
            <UI.CardTitle>Distribuição de Horários</UI.CardTitle>
            <UI.CardDescription>
              Visão geral da ocupação dos turnos
            </UI.CardDescription>
          </UI.CardHeader>
          <UI.CardContent>
            <div className="h-auto md:h-[300px] flex flex-col md:flex-row items-center justify-center gap-6 py-4">
              <div className="w-full md:flex-1 space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Completos</span>
                  <span className="font-medium">
                    {stats?.fullMaxParticipantsPerTurn || 0}
                  </span>
                </div>
                <div className="h-5 bg-muted rounded-full overflow-hidden">
                  <div className="h-5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-800 transition-all duration-300"
                      style={{
                        width: `${
                          stats?.totalPrayerTurns
                            ? (stats.fullMaxParticipantsPerTurn /
                                stats.totalPrayerTurns) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Parciais</span>
                  <span className="font-medium">
                    {stats?.partialPrayerTurns || 0}
                  </span>
                </div>
                <div className="h-5 bg-muted rounded-full overflow-hidden">
                  <div className="h-5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-500 transition-all duration-300"
                      style={{
                        width: `${
                          stats?.totalPrayerTurns
                            ? (stats.partialPrayerTurns /
                                stats.totalPrayerTurns) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Vazios</span>
                  <span className="font-medium">
                    {stats?.emptyPrayerTurns || 0}
                  </span>
                </div>
                <div className="h-5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-destructive"
                    style={{
                      width: `${
                        ((stats?.emptyPrayerTurns || 0) /
                          (stats?.totalPrayerTurns || 1)) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="w-[160px] h-[160px] md:w-[200px] md:h-[200px] relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold">
                      {Math.round(stats?.shiftsPercentage || 0)}%
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground">
                      Preenchimento
                    </div>
                  </div>
                </div>
                <svg width="100%" height="100%" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="10"
                    strokeDasharray="251.2"
                    strokeDashoffset={
                      251.2 - (251.2 * (stats?.shiftsPercentage || 0)) / 100
                    }
                    transform="rotate(-90 50 50)"
                  />
                </svg>
              </div>
            </div>
          </UI.CardContent>
        </UI.Card>

        <RecommendedShiftsCard />
      </div>

      <UI.Card>
        <UI.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <UI.CardTitle>Testemunhos Recentes</UI.CardTitle>
            <UI.CardDescription>
              Relatos dos líderes durante os turnos
            </UI.CardDescription>
          </div>
          <UI.Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() => setActiveTab("testimonies")}
          >
            <span>Ver todos</span>
            <ArrowUpRight className="h-4 w-4" />
          </UI.Button>
        </UI.CardHeader>
        <UI.CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testimonies
              .filter((testimony) => testimony.approved)
              .slice(0, 3)
              .map((testimony) => (
                <div
                  key={testimony.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm md:text-base">
                      {testimony.user.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(testimony.date, "dd/MM/yyyy")}
                    </div>
                  </div>
                  <p className="text-xs md:text-sm line-clamp-3">
                    {testimony.content}
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MessageSquareQuote className="h-3 w-3 mr-1" />
                    <span>Testemunho aprovado</span>
                  </div>
                </div>
              ))}
          </div>
        </UI.CardContent>
      </UI.Card>
    </>
  );
}
