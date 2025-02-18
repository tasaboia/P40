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
import { useTranslations } from "next-intl";

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
  const t = useTranslations("prayer_turn");
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
          title: t("subscribe_success"),
          description: t("subscribe_success_desc"),
        });
      }
    } catch (error) {
      console.log(error);
      toast({
        variant: "destructive",
        title: t("subscribe_error"),
        description: t("subscribe_error_desc"),
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
          variant: "success",
          title: t("unsubscribe_success"),
          description: t("unsubscribe_success_desc"),
        });
      }
    } catch (error) {
      console.log(error);
      toast({
        variant: "destructive",
        title: t("unsubscribe_error"),
        description: t("unsubscribe_error_desc"),
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
                  ? t("max_leaders", {
                      count: event?.maxParticipantsPerTurn || 0,
                    })
                  : t("empty_schedule")}
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
                  {t("leave_schedule")}
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
                  <Plus /> {t("join_schedule")}
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
