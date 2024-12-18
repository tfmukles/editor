"use client";

import { CircleChevronLeft, CircleChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PageHeader() {
  const router = useRouter();
  return (
    <div className="text-right flex justify-between px-2 items-center  sticky  py-4 pr-8  border-b bg-light top-0 right-0 z-50">
      <div className="flex space-x-4">
        <CircleChevronLeft
          onClick={() => router.back()}
          className="w-8 h-8 cursor-pointer"
        />
        <CircleChevronRight
          onClick={() => router.forward()}
          className="w-8 h-8 cursor-pointer"
        />
      </div>
    </div>
  );
}
