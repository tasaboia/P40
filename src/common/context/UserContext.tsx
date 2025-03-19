"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getUser } from "@p40/services/user/user-service";
import { auth } from "../../../auth";

const UserContext = createContext<any>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const session = await auth();
      if (session) {
        const userData = await getUser(session.user.id);
        setUser(userData?.user);
      }
    };

    fetchUser();
  }, []);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  return useContext(UserContext);
};
