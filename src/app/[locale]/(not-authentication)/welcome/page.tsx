import { WelcomeTabs } from "@p40/components/custom/setup/setup";
import Image from "next/image";

export default async function Home() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-3 ">
      <div className="flex w-full items-center max-w-sm flex-col gap-6">
        <Image
          src={"/icon.png"}
          width={80}
          height={80}
          alt="Imagem de perfil"
        />
        <WelcomeTabs />
      </div>
    </div>
  );
}
