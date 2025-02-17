"use client";
import { TurnLeader } from "@p40/common/contracts/user/user";
import { Helpers } from "@p40/common/utils/helpers";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@p40/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@p40/components/ui/avatar";

export function TurnItem({
  startTime,
  weekday,
  turnLeaders,
}: {
  startTime: string;
  weekday: string;
  turnLeaders: TurnLeader[] | null;
}) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>
          <div className="flex w-full ">{JSON.stringify(turnLeaders)}</div>
        </AccordionTrigger>
        <AccordionContent>
          {turnLeaders ? (
            turnLeaders.map((leader) => (
              <div className="flex max-w-60 gap-2 px-4 pt-4 text-sm">
                <Avatar key={leader.id} className="h-12 w-12 rounded-full">
                  <AvatarImage src={leader.imageUrl} alt="Imagem de perfil" />
                  <AvatarFallback className="rounded-full">
                    {Helpers.getInitials(leader.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {Helpers.getFirstAndLastName(leader.name)}
                  </span>
                  <span className="truncate text-xs">{leader.whatsapp}</span>
                </div>
              </div>
            ))
          ) : (
            <p>Esta vazio</p>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
