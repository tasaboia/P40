"use client";

import { useState } from "react";

import { Helpers } from "@p40/common/utils/helpers";
import { Avatar, AvatarImage } from "@p40/components/ui/avatar";
import { PrayerTurnResponse } from "@p40/common/contracts/user/user";
import { MessageCircle, Plus } from "lucide-react";
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
  const [selectedTurn, setSelectedTurn] = useState<string | null>(null);

  return (
    <div>
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
                <Button className="w-full" variant="destructive">
                  <Plus />
                  Sair do horário
                </Button>
              ) : (
                <Button className="w-full" variant="secondary">
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
