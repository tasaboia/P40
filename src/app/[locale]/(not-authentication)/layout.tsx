import { ChangeLanguage } from "@p40/components/custom/menu-language/menu-language";
import React, { ReactNode } from "react";

export default function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  return (
    <React.Fragment>
      <ChangeLanguage />
      {children}
    </React.Fragment>
  );
}
