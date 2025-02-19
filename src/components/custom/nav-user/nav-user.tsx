import { Avatar, AvatarFallback, AvatarImage } from "@p40/components/ui/avatar";
import { Helpers } from "@p40/common/utils/helpers";

import { getChurchById } from "@p40/services/zion";
import { Settings } from "../settings/settings";
import { eventByChurchId } from "@p40/services/event/event-byId";
import { getTranslations } from "next-intl/server";
import { auth } from "../../../../auth";
import { notFound } from "next/navigation";

export default async function NavUser() {
  const session = await auth();
  if (!session.user.churchId) notFound();

  const church = await getChurchById(session.user.churchId);
  const event = await eventByChurchId(session.user.churchId);
  const t = await getTranslations("prayer_turn");

  return (
    <div className="flex justify-between  bg-white">
      <div className="flex max-w-60 gap-2 p-4 text-sm">
        <Avatar className="h-12 w-12 rounded-full">
          <AvatarImage src={session.user.imageUrl} alt="Imagem de perfil" />
          <AvatarFallback className="rounded-full">
            {Helpers.getInitials(session.user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col text-left text-sm leading-tight h-full justify-center">
          <p className="truncate font-semibold">
            Olá, {Helpers.getFirstAndLastName(session.user.name)}
          </p>
          <p className="truncate text-xs">
            {church.name} | {t(event.type)}
          </p>
        </div>
      </div>
      <Settings user={session.user} />
    </div>
  );
}
