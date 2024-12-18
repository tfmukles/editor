import { Skeleton } from "@/components/ui/skeleton";

export default function () {
  return (
    <div className="grid xl:grid-cols-2 gap-8">
      <div className="space-y-8">
        <div className="border border-border space-y-5 px-8 py-10 rounded-lg">
          <Skeleton className="h-4" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-3 w-1/2" />

          <div className="border border-border space-x-1.5 p-7 rounded-lg space-y-3">
            <div className="flex space-x-3">
              <div className="flex-1">
                <Skeleton className="h-6 w-3/4" />
              </div>
              <Skeleton className="size-10 ml-auto rounded-full" />
            </div>
            <Skeleton className="h-5" />
          </div>

          <div className="border border-border space-x-1.5 p-7 rounded-lg space-y-3">
            <div className="flex space-x-3">
              <div className="flex-1">
                <Skeleton className="h-6 w-3/4" />
              </div>
              <Skeleton className="size-10 ml-auto rounded-full" />
            </div>
            <Skeleton className="h-5" />
          </div>
        </div>

        <div className="border border-border space-y-5 px-8 py-10 rounded-lg">
          <Skeleton className="h-5 w-1/2" />
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, i) => i + 1).map((item) => {
              return (
                <div key={item} className="flex space-x-2">
                  <Skeleton className="size-8 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="w-3/4 h-4" />
                    <Skeleton className="h-5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="border border-border space-y-5 px-8 py-10 rounded-lg">
          <Skeleton className="h-5 w-1/2" />
          {Array.from({ length: 3 }, (_, i) => i + 1).map((item) => {
            return (
              <div key={item} className="space-y-3">
                <Skeleton className="w-40 h-3" />
                <Skeleton className="w-full h-5" />
              </div>
            );
          })}
        </div>

        <div className="border border-border space-y-5 px-8 py-10 rounded-lg"></div>
      </div>
    </div>
  );
}
