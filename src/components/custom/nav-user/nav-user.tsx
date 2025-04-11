import { Avatar, AvatarFallback, AvatarImage } from "@p40/components/ui/avatar";
import { Helpers } from "@p40/common/utils/helpers";
import { getChurchById } from "@p40/services/zion";
import { Settings } from "../settings/settings";
import { eventByChurchId } from "@p40/services/event/event-byId";
import { getTranslations } from "next-intl/server";
import { getTurns } from "@p40/services/event/get-turn";
import { auth } from "../../../../auth";
import { getUser } from "@p40/services/user/user-service";
import { ErrorHandler } from "../error-handler";

export default async function NavUser() {
  const session = await auth();
  if (!session) {
    return (
      <ErrorHandler
        error={{
          title: "Erro ao carregar dados do usuário",
          description: "Não foi possível carregar os dados do usuário",
        }}
      />
    );
  }

  const userData = await getUser(session.user.id);

  if (!userData.success || !userData?.user) {
    return (
      <ErrorHandler
        error={{
          title: "Erro ao carregar dados do usuário",
          description:
            userData.error || "Não foi possível carregar os dados do usuário",
        }}
      />
    );
  }

  const { churchId, id: userId, imageUrl, name } = userData.user;

  const [church, event, t] = await Promise.all([
    getChurchById(churchId),
    eventByChurchId(churchId),
    getTranslations("common"),
  ]);

  const turnItems = event?.id
    ? await getTurns({ eventId: event?.id, userId, filtered: true })
    : [];

  return (
    <div className="flex justify-between bg-white">
      <div className="flex max-w-60 gap-2 p-4 text-sm">
        <Avatar className="h-12 w-12 rounded-full">
          <AvatarImage src={imageUrl} alt={t("profile_image")} />
          <AvatarFallback className="rounded-full">
            {Helpers.getInitials(name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col text-left text-sm leading-tight h-full justify-center">
          <p className="truncate font-semibold">
            {t("greeting")}, {Helpers.getFirstAndLastName(name)}
          </p>
          {event && church && (
            <p className="truncate text-xs">
              {church.name} | {t(`event_types.${event.type}`)}
            </p>
          )}
        </div>
      </div>

      <Settings user={userData.user} turnItens={turnItems} event={event} />
    </div>
  );
}
