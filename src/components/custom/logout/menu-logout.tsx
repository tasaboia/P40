"use client";

import * as React from "react";

import { Button } from "@p40/components/ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@p40/components/ui/tooltip";
export function Logout() {
  return (
    <div className=" absolute top-4 right-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary" onClick={() => signOut()}>
              <LogOut />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Sair</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
