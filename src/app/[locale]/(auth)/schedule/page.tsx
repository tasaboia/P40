import React, { Suspense } from "react";
import Loading from "./loading";
import NavUser from "@p40/components/custom/nav-user/nav-user";
import { WeekTab } from "@p40/components/custom/week/week-tab";
import { auth } from "../../../../../auth";
import { getUser } from "@p40/services/user/user-service";
import { Onboarding } from "@p40/components/custom/user-edit/onboarding";

export default async function ScheulePage() {
  const session = await auth();
  console.log(session);
  const data = await getUser(session.user.id);

  return (
    <Suspense fallback={<Loading />}>
      <div className="flex  flex-col gap-4 bg-muted">
        {data?.user?.onboarding ? (
          <React.Fragment>
            <NavUser user={data.user} churchId={session.user.churchId} />
            <WeekTab session={session} />
          </React.Fragment>
        ) : (
          <Onboarding user={data.user} />
        )}
      </div>
    </Suspense>
  );
}
