import NavUser from "@p40/components/custom/nav-user/nav-user";
import SkeletonNavUser from "@p40/components/custom/nav-user/skeleton-nav-user";
import React, { lazy, ReactNode, Suspense } from "react";
import Loading from "./loading";
import { auth } from "../../../../auth";
import { DashboardTabs } from "@p40/common/constants";
import { eventByChurchId } from "@p40/services/event/event-byId";

const DashboardLazy = lazy(
  () => import("./dashboard/components/dashboard-wrapper")
);

export default async function Layout({ children }: { children: ReactNode }) {
  const session = await auth();
  let filteredTabs = [];
  let eventId;

  if (session && session.user && session.user.role) {
    filteredTabs = DashboardTabs.filter((tabs) =>
      tabs.role.includes(session.user.role)
    );
    
    // Obter eventId apenas se churchId existir
    const churchId = session.user.churchId;
    if (churchId) {
      try {
        const event = await eventByChurchId(churchId);
        eventId = event?.id;
      } catch (error) {
        console.error("Erro ao buscar evento por churchId:", error);
      }
    }
  }

  return (
    <React.Fragment>
      <Suspense fallback={<SkeletonNavUser />}>
        <NavUser />
      </Suspense>
      <Suspense fallback={<Loading />}>
        <DashboardLazy eventId={eventId} filteredTabs={filteredTabs}>
          {children}
        </DashboardLazy>
      </Suspense>
    </React.Fragment>
  );
}
