import { Skeleton } from "@p40/components/ui/skeleton";

export function WeekSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[125px] w-full rounded-xl" />
    </div>
  );
}
