import { Avatar, AvatarFallback, AvatarImage } from "@p40/components/ui/avatar";
import { Helpers } from "@p40/common/utils/helpers";

import { getChurchById } from "@p40/services/zion";
import { Settings } from "../settings/settings";
import { eventByChurchId } from "@p40/services/event/event-byId";
import { getTranslations } from "next-intl/server";
import { getTurns } from "@p40/services/event/get-turn";
import { User } from "@p40/common/contracts/user/user";

async function fetchData(churchId: string, userId: string) {
  const [church, event, t] = await Promise.all([
    getChurchById(churchId),
    eventByChurchId(churchId),
    getTranslations("prayer_turn"),
  ]);

  const turnItens = event?.id
    ? await getTurns({ eventId: event.id, userId })
    : [];

  return { church, event, turnItens, t };
}

interface NavUserProps {
  user: User;
  churchId: string;
}
export default async function NavUser({ user, churchId }: NavUserProps) {
  const { church, event, turnItens, t } = await fetchData(churchId, user.id);

  return (
    <div className="flex justify-between  bg-white">
      <div className="flex max-w-60 gap-2 p-4 text-sm">
        <Avatar className="h-12 w-12 rounded-full">
          <AvatarImage src={user.imageUrl} alt="Imagem de perfil" />
          <AvatarFallback className="rounded-full">
            {Helpers.getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col text-left text-sm leading-tight h-full justify-center">
          <p className="truncate font-semibold">
            Olá, {Helpers.getFirstAndLastName(user.name)}
          </p>
          <p className="truncate text-xs">
            {church.name} | {t(event.type)}
          </p>
        </div>
      </div>
      <Settings user={user} turnItens={turnItens} />
    </div>
  );
}
