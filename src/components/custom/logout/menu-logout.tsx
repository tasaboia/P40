"use client";

import * as React from "react";

import { Button } from "@p40/components/ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
export function Logout() {
  return (
    <div className=" absolute top-4 right-4">
      <Button onClick={() => signOut()}>
        <LogOut />
      </Button>
    </div>
  );
}
