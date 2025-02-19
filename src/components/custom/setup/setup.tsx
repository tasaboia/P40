"use client";

import { LoginForm } from "../login/login";
import ZionSelect from "../select/zion-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { useSettingStore } from "@p40/common/states/zion";
import { useTranslations } from "next-intl";

export function SetUp() {
  const { activeTab, setActiveTab, selectedZion } = useSettingStore();
  const t = useTranslations("setup");
  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full sm:w-auto "
    >
      <TabsList className="grid w-full grid-cols-2 bg-muted">
        <TabsTrigger value="zion">{t("choose_zion")}</TabsTrigger>
        <TabsTrigger disabled={selectedZion == null} value="login">
          {t("enter_schedules")}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="zion">
        <ZionSelect />
      </TabsContent>
      <TabsContent value="login">
        <LoginForm />
      </TabsContent>
    </Tabs>
  );
}
