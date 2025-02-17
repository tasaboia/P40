// "use client";

// import { useState } from "react";

// import { Helpers } from "@p40/common/utils/helpers";
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "@p40/components/ui/accordion";
// import { Avatar, AvatarFallback, AvatarImage } from "@p40/components/ui/avatar";
// import { PrayerTurnResponse } from "@p40/common/contracts/user/user";
// import { UserPlus } from "lucide-react";

// export function TurnItem({
//   weekday,
//   shift,
//   turnItens,
// }: {
//   turnItens: PrayerTurnResponse[];
//   weekday: string;
//   shift: {
//     startTime: string;
//     endTime: string;
//   }[];
// }) {
//   const [selectedTurn, setSelectedTurn] = useState<string | null>(null);

//   //se o horario estiver vazio nao espande e seja um botao para adiciona a si mesmo
//   //duvida precios mudar de componnete?
//   //nao ele eh um trigger ja ehu m botao.
//   //so que repciso confirmar meu whatapp pra isso ne (depois)

//   return (
//     <Accordion
//       type="single"
//       collapsible
//       className="w-full"
//       onValueChange={(value) => setSelectedTurn(value)}
//     >
//       {shift.map((turn) => {
//         const leaders = turnItens?.find(
//           (item) => item.startTime == turn.startTime
//         )?.leaders;

//         return (
//           <AccordionItem key={turn.startTime} value={turn.startTime}>
//             <AccordionTrigger>
//               <div className="flex w-full ">
//                 {selectedTurn !== turn.startTime ? (
//                   leaders?.length > 0 ? (
//                     leaders
//                       .map((item) => Helpers.getFirstAndLastName(item.name))
//                       .join(" ")
//                   ) : (
//                     <div className="flex gap-2">
//                       <UserPlus />
//                       Me inscrever no horário
//                     </div>
//                   )
//                 ) : (
//                   "ta selecionado"
//                 )}
//               </div>
//             </AccordionTrigger>
//             <AccordionContent>
//               {leaders ? (
//                 leaders.map((leader) => (
//                   <div
//                     key={leader.id}
//                     className="flex max-w-60 gap-2 px-4 pt-4 text-sm"
//                   >
//                     <Avatar className="h-12 w-12 rounded-full">
//                       <AvatarImage
//                         src={leader.imageUrl}
//                         alt="Imagem de perfil"
//                       />
//                       <AvatarFallback className="rounded-full">
//                         {Helpers.getInitials(leader.name)}
//                       </AvatarFallback>
//                     </Avatar>
//                     <div className="grid flex-1 text-left text-sm leading-tight">
//                       <span className="truncate font-semibold">
//                         {Helpers.getFirstAndLastName(leader.name)}
//                       </span>
//                       <span className="truncate text-xs">
//                         {leader.whatsapp}
//                       </span>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <p>Esta vazio</p>
//               )}
//             </AccordionContent>
//           </AccordionItem>
//         );
//       })}
//     </Accordion>
//   );
// }

"use client";

import { useState } from "react";

import { Helpers } from "@p40/common/utils/helpers";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@p40/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@p40/components/ui/avatar";
import { PrayerTurnResponse } from "@p40/common/contracts/user/user";
import { BellRing, Check, Clock, Plus, UserPlus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@p40/components/ui/card";
import { Button } from "@p40/components/ui/button";
type CardProps = React.ComponentProps<typeof Card>;
export function TurnItem({
  weekday,
  shift,
  turnItens,
}: {
  turnItens: PrayerTurnResponse[];
  weekday: string;
  shift: {
    startTime: string;
    endTime: string;
  }[];
}) {
  const [selectedTurn, setSelectedTurn] = useState<string | null>(null);

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      onValueChange={(value) => setSelectedTurn(value)}
    >
      {shift.map((turn) => {
        const leaders = turnItens?.find(
          (item) => item.startTime == turn.startTime
        )?.leaders;

        return (
          <Card key={turn.endTime} className="m-3">
            {/* <CardHeader>
              <CardTitle>{turn.startTime}</CardTitle>
              <CardDescription>
                {leaders ? "Esse horário esta vazio" : "3 Líderes por horário"}
              </CardDescription>
            </CardHeader> */}
            <CardContent className="grid gap-4 pt-4 ">
              <div className=" flex items-center space-x-4 rounded-md border p-4">
                <Clock />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {turn.startTime}
                  </p>
                </div>
                <switch />
              </div>
              <div>
                {leaders?.length > 0 &&
                  leaders.map((leader) => (
                    <div
                      key={leader.id}
                      className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
                    >
                      <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {Helpers.getFirstAndLastName(leader.name)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {leader.whatsapp}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <Plus /> Se inscrever no horário
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </Accordion>
  );
}
