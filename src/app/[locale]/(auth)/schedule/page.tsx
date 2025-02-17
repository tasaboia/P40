import React, { Suspense } from "react";
import Loading from "./loading";
import { auth } from "../../../../../auth";
import Schedule from "@p40/components/custom/schedule/schedule";

export default async function ScheulePage() {
  const session = await auth();

  return (
    <Suspense fallback={<Loading />}>
      <Schedule
        email={session.user.email}
        imageUrl={session.user.imageUrl}
        name={session.user.name}
      />
    </Suspense>
  );
}
