import NavUser from "@p40/components/custom/nav-user/nav-user";
import SkeletonNavUser from "@p40/components/custom/nav-user/skeleton-nav-user";
import { getUser } from "@p40/services/user/user-service";
import React, { ReactNode, Suspense } from "react";
import { auth } from "../../../../auth";

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  const data = await getUser(session?.user?.id);

  if (!data.user.churchId) return null;

  return (
    <React.Fragment>
      <Suspense fallback={<SkeletonNavUser />}>
        <NavUser user={data?.user} churchId={data.user.churchId.toString()} />
      </Suspense>
      {children}
    </React.Fragment>
  );
}
