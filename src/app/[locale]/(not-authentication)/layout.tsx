import { OnboardingProvider } from "@p40/common/context/onboarding-context";
import { LanguageSwitcher } from "@p40/components/custom/menu-language/menu-language";
import React, { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <React.Fragment>
      <LanguageSwitcher />
      <OnboardingProvider>{children}</OnboardingProvider>
    </React.Fragment>
  );
}
