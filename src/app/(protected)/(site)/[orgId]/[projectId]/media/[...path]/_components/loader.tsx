import { Skeleton } from "@/components/ui/skeleton";

export default function MediaSkeleton() {
  return (
    <div className="mt-7 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 relative">
      {Array.from({ length: 18 }, (_, index) => index).map((index) => {
        return (
          <div
            key={index}
            className="flex flex-col space-y-3 border border-border rounded-lg overflow-hidden"
          >
            <Skeleton className="h-[125px] w-full rounded-xl rounded-bl-none rounded-br-none" />
            <div className="space-y-2">
              <Skeleton className="mt-1 rounded-none w-full h-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
