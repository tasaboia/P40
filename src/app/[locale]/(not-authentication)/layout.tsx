import { OnboardingProvider } from "@p40/common/context/onboarding-context";
import { ChangeLanguage } from "@p40/components/custom/menu-language/menu-language";
import React, { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <React.Fragment>
      <ChangeLanguage />
      <OnboardingProvider>{children}</OnboardingProvider>
    </React.Fragment>
  );
}
