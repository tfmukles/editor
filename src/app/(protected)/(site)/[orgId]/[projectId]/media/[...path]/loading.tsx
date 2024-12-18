"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { selectMediaInfo } from "@/redux/features/media-manager/slice";
import { useSelector } from "react-redux";

export default function () {
  const { view } = useSelector(selectMediaInfo);
  if (view === "list") {
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
