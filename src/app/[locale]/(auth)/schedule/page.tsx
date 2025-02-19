import React, { Suspense } from "react";
import Loading from "./loading";
import Schedule from "@p40/components/custom/schedule/schedule";

export default async function ScheulePage() {
  return (
    <Suspense fallback={<Loading />}>
      <Schedule />
    </Suspense>
  );
}
