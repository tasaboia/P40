import * as React from "react";
import { Clock, X } from "lucide-react";
import { Button } from "@p40/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@p40/components/ui/drawer";
import { unsubscribe } from "@p40/services/event/prayer-turn/unsubscribe";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { User } from "@p40/common/contracts/user/user";
import { PrayerTurn } from "@p40/common/contracts/config/config";
import { Weekday } from "@p40/common/contracts/week/schedule";
import { toast } from "@p40/hooks/use-toast";
interface TurnsUserList {
  user: User;
  turnItens: PrayerTurn[] | null;
}
export function TurnsUserList({ turnItens, user }: TurnsUserList) {
  const [loading, setLoading] = React.useState(false);
  const t = useTranslations("prayer.turns");
  const messages = useTranslations("prayer.turns.messages");
  const router = useRouter();

  const handlePrayerTurnUnsubscribe = async ({
    userId,
    prayerTurnId,
  }: {
    userId: string;
    prayerTurnId: string;
  }) => {
    try {
      setLoading(true);

      const response = await unsubscribe(userId, prayerTurnId);

      if (!response?.error) {
        toast({
          variant: "default",
          title: messages("unsubscribe.success"),
          description: messages("unsubscribe.success_desc"),
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: messages("unsubscribe.error"),
        description: messages("unsubscribe.error_desc"),
      });
    } finally {
      setLoading(false);
      router.refresh();
    }
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <div className="flex p-[6px] rounded mb-1 transition-colors hover:bg-accent hover:text-accent-foreground gap-2 items-center text-sm px-2">
          <Clock className="h-4 w-4" />
          <Button variant="ghost" className="font-normal text-sm p-0 h-[20px]">
            {t("my_schedules")}
          </Button>
        </div>
      </DrawerTrigger>
      <DrawerContent className="transition-all overflow-y-auto">
        <div className="mx-auto w-full max-w-sm overflow-y-auto pb-32">
          <DrawerHeader>
            <DrawerTitle>{t("my_prayer_turns")}</DrawerTitle>
            {(!turnItens || turnItens?.length == 0) && (
              <DrawerDescription>{t("no_schedules")}</DrawerDescription>
            )}
          </DrawerHeader>
          <div>
            {turnItens?.length >= 0 &&
              turnItens.map((item) => (
                <div
                  key={item.id}
                  className={`m-2 rounded-md border flex justify-between items-center p-2`}
                >
                  <div className="flex items-center  space-x-4 ">
                    <Clock />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none capitalize">
                        {`${
                          Object.keys(Weekday)[
                            item.weekday
                          ] as keyof typeof Weekday
                        }`}
                        <span className="px-1">{t("at")}</span>
                        {item.startTime}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="text-destructive"
                    onClick={() =>
                      handlePrayerTurnUnsubscribe({
                        userId: user.id,
                        prayerTurnId: item.id,
                      })
                    }
                  >
                    <X />
                    {t("actions.leave")}
                  </Button>
                </div>
              ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
