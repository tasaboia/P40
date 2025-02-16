import React from "react";
import { auth } from "../../../../../auth";

export default async function ScheulePage() {
  const session = await auth();
  return <div>{JSON.stringify(session)}</div>;
}
