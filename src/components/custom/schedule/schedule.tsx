import React from "react";
import NavUser from "../nav-user/nav-user";
import { WeekTab } from "../week/week-tab";

interface ScheduleProps {
  imageUrl: string;
  name: string;
  email: string;
  churchId: string;
}
export default function Schedule(props: ScheduleProps) {
  return (
    <div className="flex  flex-col gap-4 bg-muted">
      <NavUser
        imageUrl={props.imageUrl}
        name={props.name}
        churchId={props.churchId}
      />
      <WeekTab />
    </div>
  );
}
