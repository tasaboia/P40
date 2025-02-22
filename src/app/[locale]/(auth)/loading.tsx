import { Loader2 } from "lucide-react";
import React from "react";

export default function Loading() {
  return (
    <div className=" flex justify-center items-center w-screen h-screen bg-muted opacity-50">
      <Loader2 className="animate-spin" />
    </div>
  );
}
