import NavUser from "@p40/components/custom/nav-user/nav-user";
import SkeletonNavUser from "@p40/components/custom/nav-user/skeleton-nav-user";
import React, { ReactNode, Suspense } from "react";

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <React.Fragment>
      <Suspense fallback={<SkeletonNavUser />}>
        <NavUser />
      </Suspense>
      {children}
    </React.Fragment>
  );
}
