import { Avatar, AvatarFallback, AvatarImage } from "@p40/components/ui/avatar";
import { Helpers } from "@p40/common/utils/helpers";
import { Logout } from "../logout/menu-logout";

export default function NavUser({
  imageUrl,
  name,
  email,
}: {
  imageUrl: string;
  name: string;
  email: string;
}) {
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
          <span className="truncate text-xs">{email}</span>
        </div>
      </div>
      <Logout />
    </div>
  );
}
