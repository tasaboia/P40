import { Avatar, AvatarFallback, AvatarImage } from "@p40/components/ui/avatar";
import { Helpers } from "@p40/common/utils/helpers";

import { getChurchById } from "@p40/services/zion";
import { Settings } from "../settings/settings";
import { eventByChurchId } from "@p40/services/event/event-byId";
import { getTranslations } from "next-intl/server";
import { getTurns } from "@p40/services/event/get-turn";

export default async function NavUser({ user, churchId }) {
  const church = await getChurchById(churchId);
  const event = await eventByChurchId(churchId);
  const turnItens = await getTurns({ eventId: event?.id, userId: user?.id });

  const t = await getTranslations("prayer_turn");

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
