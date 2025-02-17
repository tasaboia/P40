import React, { Suspense } from "react";
import Loading from "./loading";
import { auth } from "../../../../../auth";
import UserDetails from "@p40/components/custom/user-details/user-details";

export default async function ScheulePage() {
  const session = await auth();

  return (
    <Suspense fallback={<Loading />}>
      <UserDetails
        email={session.user.email}
        imageUrl={session.user.imageUrl}
        name={session.user.name}
      />
    </Suspense>
  );
}
