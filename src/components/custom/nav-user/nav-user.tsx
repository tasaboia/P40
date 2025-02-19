import { Avatar, AvatarFallback, AvatarImage } from "@p40/components/ui/avatar";
import { Helpers } from "@p40/common/utils/helpers";

import { getChurchById } from "@p40/services/zion";
import { Settings } from "../settings/settings";

export default async function NavUser({
  imageUrl,
  name,
  churchId,
}: {
  imageUrl: string;
  name: string;
  churchId: string;
}) {
  const church = await getChurchById(churchId);
  return (
    <div className="flex justify-between  bg-white">
      <div className="flex max-w-60 gap-2 p-4 text-sm">
        <Avatar className="h-12 w-12 rounded-full">
          <AvatarImage src={imageUrl} alt="Imagem de perfil" />
          <AvatarFallback className="rounded-full">
            {Helpers.getInitials(name)}
          </AvatarFallback>
        </Avatar>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-semibold">
            Olá, {Helpers.getFirstAndLastName(name)}
          </span>
          <span className="truncate text-xs">{church.name}</span>
        </div>
      </div>
      <Settings />
    </div>
  );
}
