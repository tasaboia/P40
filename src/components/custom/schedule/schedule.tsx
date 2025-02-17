import React from "react";
import NavUser from "../nav-user/nav-user";
import { WeekTab } from "../week/week-tab";

interface ScheduleProps {
  imageUrl: string;
  name: string;
  email: string;
}
export default function Schedule(props: ScheduleProps) {
  return (
    <div className="flex  flex-col gap-4">
      <NavUser
        email={props.email}
        imageUrl={props.imageUrl}
        name={props.name}
      />
      <WeekTab />
    </div>
  );
}
