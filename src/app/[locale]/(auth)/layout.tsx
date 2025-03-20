import NavUser from "@p40/components/custom/nav-user/nav-user";
import SkeletonNavUser from "@p40/components/custom/nav-user/skeleton-nav-user";
import React, { lazy, ReactNode, Suspense } from "react";
import Loading from "./loading";

const DashboardLazy = lazy(
  () => import("./dashboard/components/dashboard-wrapper")
);

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <React.Fragment>
      <Suspense fallback={<SkeletonNavUser />}>
        <NavUser />
      </Suspense>
      <Suspense fallback={<Loading />}>
        <DashboardLazy>{children}</DashboardLazy>
      </Suspense>
    </React.Fragment>
  );
}
