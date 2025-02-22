import React, { Suspense } from "react";
import Loading from "../loading";
import { WeekTab } from "@p40/components/custom/week/week-tab";
import { auth } from "../../../../../auth";
import { getUser } from "@p40/services/user/user-service";
import { Onboarding } from "@p40/components/custom/user-edit/onboarding";

export default async function ScheulePage() {
  const session = await auth();
  const data = await getUser(session?.user?.id);

  if (!data?.user?.onboarding)
    return (
      <Suspense fallback={<Loading />}>
        <Onboarding user={data.user} />
      </Suspense>
    );

  if (data.user && data.user.churchId) {
    return (
      <div className="flex  flex-col gap-4 bg-muted">
        <WeekTab />
      </div>
    );
  }

  return null;
}
