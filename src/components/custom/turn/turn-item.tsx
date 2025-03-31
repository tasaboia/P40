"use client";

import { Avatar, AvatarImage } from "@p40/components/ui/avatar";
import { Clock, MessageCircle, Plus } from "lucide-react";
import { Helpers } from "@p40/common/utils/helpers";
import { PrayerTurnResponse } from "@p40/common/contracts/user/user";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@p40/components/ui/card";
import { Button } from "@p40/components/ui/button";
import { EventResponse } from "@p40/common/contracts/event/event";
import { subscribe } from "@p40/services/event/prayer-turn/subscribe";
import { toast } from "@p40/hooks/use-toast";
import { unsubscribe } from "@p40/services/event/prayer-turn/unsubscribe";
import { useRouter } from "@p40/i18n/routing";
import { useTranslations } from "next-intl";
import { Weekday } from "@p40/common/contracts/week/schedule";
import Link from "next/link";
import React, { useState } from "react";

//TODO: atualizar o valor na lista para o usuario antes mesmo de atualizar no backend

export function TurnItem({
  weekday,
  shift,
  turnItens,
  userId,
  event,
}: {
  turnItens: PrayerTurnResponse[];
  weekday: string;
  userId: string;
  event: EventResponse | null;
  shift: {
    startTime: string;
    endTime: string;
  }[];
}) {
  const t = useTranslations("prayer.turns");

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePrayerTurnSubscribe = async ({
    userId,
    eventId,
    startTime,
    weekday,
  }: {
    userId: string;
    eventId: string;
    startTime: string;
    weekday: number;
  }) => {
    try {
      setLoading(true);

      const response = await subscribe(userId, eventId, startTime, weekday);

      if (!response?.error) {
        toast({
          variant: "success",
          title: t("messages.subscribe.success"),
          description: t("messages.subscribe.success_desc"),
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("messages.subscribe.error"),
        description: t("messages.subscribe.error_desc"),
      });
    } finally {
      setLoading(false);
      router.refresh();
    }
  };

  const handlePrayerTurnUnsubscribe = async ({
    userId,
    prayerTurnId,
  }: {
    userId: string;
    prayerTurnId: string;
  }) => {
    try {
      setLoading(true);
      const response = await unsubscribe(userId, prayerTurnId);

      if (!response?.error) {
        toast({
          variant: "warning",
          title: t("messages.unsubscribe.success"),
          description: t("messages.unsubscribe.success_desc"),
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("messages.unsubscribe.error"),
        description: t("messages.unsubscribe.error_desc"),
      });
    } finally {
      setLoading(false);
      router.refresh();
    }
  };

  return (
    <div>
      {loading && (
        <div className="w-full flex  justify-center items-center">
          <div className="animate-spin rounded-full h-4 w-4 md:h-12 md:w-12 border-b-2 border-primary"></div>
        </div>
      )}
      {shift.map((turn) => {
        //garantir que vamos ter as informações do líder por turno
        const turnItem = turnItens?.find(
          (item) => item.startTime == turn.startTime
        );

        const weekdayIndex = Object.values(Weekday).indexOf(Weekday[weekday]);

        return (
          <Card key={turn.endTime} className="m-3">
            <CardHeader>
              <CardTitle>
                <div
                  className={`flex items-center space-x-4 rounded-md border p-4 ${
                    Helpers.isCurrentTurn(
                      turn?.startTime,
                      event?.shiftDuration,
                      weekdayIndex
                    )
                      ? "text-green-600 animate-pulse"
                      : ""
                  }`}
                >
                  <Clock />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {turn.startTime}
                    </p>
                  </div>
                  {Helpers.isCurrentTurn(
                    turn?.startTime,
                    event?.shiftDuration,
                    weekdayIndex
                  ) && (
                    <div className="flex  gap-2 text-xs">
                      <span className="flex h-2 w-2 translate-y-1 rounded-full bg-green-400" />
                      Turno em andamento
                    </div>
                  )}
                </div>
              </CardTitle>
            </CardHeader>

            {turnItem?.leaders?.length > 0 &&
              turnItem?.leaders.map((leader) => (
                <CardContent key={leader.id} className="grid gap-4 ">
                  <div key={leader.id} className="flex gap-3 items-center">
                    <Avatar className="h-10 w-10 rounded-full">
                      <AvatarImage
                        src={leader.imageUrl}
                        alt="Imagem de perfil"
                      />
                    </Avatar>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {Helpers.getFirstAndLastName(leader.name)}
                      </p>

                      <Link
                        href={`https://wa.me/${leader.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground flex items-center gap-1 hover:text-green-600 transition"
                      >
                        Chamar no whatsApp
                        <MessageCircle size={16} className="text-green-500" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              ))}

            <CardFooter>
              {turnItem?.leaders?.length > 0 &&
              turnItem?.leaders.find((leader) => leader.id == userId) ? (
                <Button
                className="w-full text-destructive"
                variant="secondary"
                disabled={loading}
                onClick={() => {
                  handlePrayerTurnUnsubscribe({
                    userId,
                    prayerTurnId: turnItem.id,  
                  });
                }}
                >
                  <Plus />
                  {t("actions.leave")}
                </Button>
              ) : (
                <React.Fragment>
                  {(!turnItem?.leaders ||
                    turnItem?.leaders.length <
                      event.maxParticipantsPerTurn) && (
                    <Button
                      className="w-full text-primary"
                      variant="secondary"
                      disabled={loading}
                      onClick={() => {
                        handlePrayerTurnSubscribe({
                          userId,
                          weekday: weekdayIndex,
                          eventId: event?.id,
                          startTime: turn.startTime,
                        });
                      }}
                    >
                      <Plus /> {t("actions.join")}
                    </Button>
                  )}
                </React.Fragment>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
