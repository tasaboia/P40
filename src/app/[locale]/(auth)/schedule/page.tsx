import React, { Suspense } from "react";
import Loading from "./loading";
import NavUser from "@p40/components/custom/nav-user/nav-user";
import { WeekTab } from "@p40/components/custom/week/week-tab";
import { auth } from "../../../../../auth";
import { getUser } from "@p40/services/user/user-service";
import { Onboarding } from "@p40/components/custom/user-edit/onboarding";

export default async function ScheulePage() {
  const session = await auth();
  const data = await getUser(session.user.id);

  if (!data?.user?.onboarding)
    return (
      <Suspense fallback={<Loading />}>
        <Onboarding user={data.user} />
      </Suspense>
    );

  if (data.user && data.user.churchId) {
    return (
      <Suspense fallback={<Loading />}>
        <div className="flex  flex-col gap-4 bg-muted">
          <NavUser user={data?.user} churchId={data.user.churchId.toString()} />
          <WeekTab churchId={data.user.churchId.toString()} />
        </div>
      </Suspense>
    );
  }

  return null;
}
