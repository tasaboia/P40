import { getAppConfig } from "@p40/services/config/config";
import React, { Suspense } from "react";
import { auth } from "../../../../../auth";
import { notFound } from "next/navigation";
import ConfigEvent from "@p40/components/custom/config-event/config-event";
import { DashboardTabs } from "@p40/components/custom/dashboard/dashboard-tabs";

export default async function Dashboard() {
  const session = await auth();
  if (!session) return notFound();
  const { event, church, user } = await getAppConfig(session.user.id);

  return (
    <Suspense fallback={<>loading...</>}>
      <DashboardTabs />
      {!event && <ConfigEvent event={event} church={church} />}
    </Suspense>
  );
}
