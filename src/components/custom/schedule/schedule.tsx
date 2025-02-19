import React from "react";
import NavUser from "../nav-user/nav-user";
import { WeekTab } from "../week/week-tab";

export default function Schedule() {
  return (
    <div className="flex  flex-col gap-4 bg-muted">
      <NavUser />
      <WeekTab />
    </div>
  );
}
