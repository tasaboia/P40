"use client";

import { Helpers } from "@p40/common/utils/helpers";
import { Avatar, AvatarImage } from "@p40/components/ui/avatar";
import { PrayerTurnResponse } from "@p40/common/contracts/user/user";
import { Loader2, MessageCircle, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@p40/components/ui/card";
import { Button } from "@p40/components/ui/button";
import Link from "next/link";
import { EventResponse } from "@p40/common/contracts/event/event";
import { subscribe } from "@p40/services/event/prayer-turn/subscribe";
import { toast } from "@p40/hooks/use-toast";
import { unsubscribe } from "@p40/services/event/prayer-turn/unsubscribe";
import { useState } from "react";
import { Weekday } from "@p40/common/contracts/schedule/schedule";
import { useRouter } from "@p40/i18n/routing";

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
          title: "Inscrição realizada com sucesso",
          description:
            "Você estará responsavel por esse horário durante os 40 dias",
        });
      }
    } catch (error) {
      console.log(error);
      toast({
        variant: "destructive",
        title: "Erro ao tentar se inscrever no horário",
        description: "Houve um erro ao tentar te inscrever, tente mais tarde",
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
          title: "Você não esta mais no turno",
          description: "Você não esta mais inscrito no turno de oração",
        });
      }
    } catch (error) {
      console.log(error);
      toast({
        variant: "destructive",
        title: "Erro ao tentar se inscrever no horário",
        description: "Houve um erro ao tentar te inscrever, tente mais tarde",
      });
    } finally {
      setLoading(false);
      router.refresh();
    }
  };

  return (
    <div>
      {loading && (
        <div className="w-full flex justify-center items-center">
          <Loader2 className="animate-spin items-center" />
        </div>
      )}
      {shift.map((turn) => {
        const leaders = turnItens?.find(
          (item) => item.startTime == turn.startTime
        )?.leaders;

        return (
          <Card key={turn.endTime} className="m-3">
            <CardHeader>
              <CardTitle>{turn.startTime}</CardTitle>
              <CardDescription>
                {leaders
                  ? `Máximo ${event.maxParticipantsPerTurn} líderes por turno`
                  : "Esse horário esta vazio"}
              </CardDescription>
            </CardHeader>

            {leaders?.length > 0 &&
              leaders.map((leader) => (
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
                        href={`https://wa.me/${leader.whatsapp.replace(
                          /\D/g,
                          ""
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground flex items-center gap-1 hover:text-green-600 transition"
                      >
                        {leader.whatsapp}
                        <MessageCircle size={16} className="text-green-500" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              ))}
            <CardFooter>
              {leaders?.length > 0 &&
              leaders.find((leader) => leader.id == userId) ? (
                <Button
                  className="w-full"
                  variant="destructive"
                  disabled={loading}
                  onClick={() => {
                    const turn = turnItens.find((item) =>
                      item.leaders.some((leader) => leader.id === userId)
                    );
                    handlePrayerTurnUnsubscribe({
                      userId,
                      prayerTurnId: turn.id,
                    });
                  }}
                >
                  <Plus />
                  Sair do horário
                </Button>
              ) : (
                <Button
                  className="w-full"
                  variant="secondary"
                  disabled={loading}
                  onClick={() => {
                    handlePrayerTurnSubscribe({
                      userId,
                      weekday: Object.values(Weekday).indexOf(Weekday[weekday]),
                      eventId: event.id,
                      startTime: turn.startTime,
                    });
                  }}
                >
                  <Plus /> Se inscrever no horário
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
