import { GalleryVerticalEnd } from "lucide-react";
import { SetUp } from "@p40/components/custom/setup/setup";
import Image from "next/image";

export default async function Home() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full items-center max-w-sm flex-col gap-6">
        <Image
          src={"/icon.png"}
          width={80}
          height={80}
          alt="Imagem de perfil"
        />
        <SetUp />
      </div>
    </div>
  );
}
