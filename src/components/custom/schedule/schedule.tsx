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
    <div>
      <NavUser
        email={props.email}
        imageUrl={props.imageUrl}
        name={props.name}
      />
      <WeekTab />
    </div>
  );
}
