"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { eventByChurchId } from "@p40/services/event/event-byId";
import { useUser } from "./UserContext";

const EventContext = createContext<any>(null);

export const EventProvider = ({ children }: { children: React.ReactNode }) => {
  const [event, setEvent] = useState(null);
  const user = useUser();

  useEffect(() => {
    const fetchEvent = async () => {
      if (user?.churchId) {
        const eventData = await eventByChurchId(user.churchId);
        setEvent(eventData);
      }
    };

    fetchEvent();
  }, [user]);

  return (
    <EventContext.Provider value={event}>{children}</EventContext.Provider>
  );
};

export const useEvent = () => {
  return useContext(EventContext);
};
