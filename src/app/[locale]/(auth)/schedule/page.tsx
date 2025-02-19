import React, { Suspense } from "react";
import Loading from "./loading";
import NavUser from "@p40/components/custom/nav-user/nav-user";
import { WeekTab } from "@p40/components/custom/week/week-tab";
import { auth } from "../../../../../auth";
import { notFound } from "next/navigation";

export default async function ScheulePage() {
  const session = await auth();
  if (!session.user.churchId) notFound();

  return (
    <Suspense fallback={<Loading />}>
      <div className="flex  flex-col gap-4 bg-muted">
        <NavUser session={session} />
        <WeekTab session={session} />
      </div>
    </Suspense>
  );
}
