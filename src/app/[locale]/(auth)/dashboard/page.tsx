import { getAppConfig } from "@p40/services/config/config";
import React, { Suspense } from "react";
import { auth } from "../../../../../auth";
import { notFound } from "next/navigation";
import ConfigEvent from "@p40/components/custom/config-event/onboarding";
import { DashboardTabs } from "@p40/components/custom/dashboard/dashboard-tabs";
import Loading from "../loading";

export default async function Dashboard() {
  const session = await auth();
  if (!session) return notFound();

  const { event, church } = await getAppConfig(session.user.id);

  return (
    <Suspense fallback={<Loading />}>
      {Array.isArray(event) && event.length === 0 ? (
        <ConfigEvent event={event} church={church} />
      ) : (
        <DashboardTabs />
      )}
    </Suspense>
  );
}
