import { getZions } from "@p40/commons/services/zion";
import Onboarding from "@p40/components/onboarding/onboarding";

export default async function Home() {
  const zions = await getZions();
  return (
    <div className="w-full flex justify-center items-center h-screen p-10">
      <Onboarding zions={zions} />
    </div>
  );
}
