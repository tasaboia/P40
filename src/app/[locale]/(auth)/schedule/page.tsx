import React, { Suspense } from "react";
import Loading from "./loading";
import NavUser from "@p40/components/custom/nav-user/nav-user";
import { WeekTab } from "@p40/components/custom/week/week-tab";
import { auth } from "../../../../../auth";
import { notFound } from "next/navigation";
import { getUser } from "@p40/services/user/user-service";
import { Onboarding } from "@p40/components/custom/user-edit/onboarding";

export default async function ScheulePage() {
  const session = await auth();

  const data = await getUser(session.user.id);
  if (!session.user) notFound();
  if (!data.user) notFound();

  return (
    <Suspense fallback={<Loading />}>
      <div className="flex  flex-col gap-4 bg-muted">
        <NavUser user={data.user} churchId={session.user.churchId} />
        <WeekTab session={session} />
        {!data.user.onboarding && <Onboarding user={data.user} />}
      </div>
    </Suspense>
  );
}
