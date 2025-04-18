"use client";
import { useOnboarding } from "@p40/common/context/onboarding-context";
import { Button } from "@p40/components/ui/button";
import api from "@p40/lib/axios";
import { Loader2 } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function GoogleLogin() {
  const session = useSession();
  const router = useRouter();
  const { onboardingData } = useOnboarding();

  const handleGoogleLogin = async () => {
    await signIn("google");
  };

  useEffect(() => {
    if (session.status == "authenticated" && session.data.user.churchId == "") {
      const updateUser = async () => {
        const response = await api.post("/api/user/update", {
          id: session.data.user.id,
          name: session.data.user.name,
          email: session.data.user.email,
          whatsapp: session.data.user.whatsapp,
          zionId: onboardingData.location.id,
          serviceAreas: onboardingData.areas,
          role:session.data.user.role || "LEADER",
        });

        if (response.status == 200 || response.status == 201) {
          router.push("schedule");
        }
      };
      updateUser();
    }
  }, [session]);

  if (session.status == "authenticated") {
    return (
      <div className="w-screen h-screen justify-center flex items-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  } else {
    return (
      <Button
        variant="outline"
        type="button"
        className="w-full"
        onClick={async () => handleGoogleLogin()}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path
            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
            fill="currentColor"
          />
        </svg>
        Login com o Google
      </Button>
    );
  }
}
