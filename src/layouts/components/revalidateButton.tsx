"use client";

import { revalidateRefresh } from "@/actions/utils";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition } from "react";

export default function RevalidateButton() {
  const router = useRouter();
  return (
    <Button
      variant={"ghost"}
      className="ml-auto"
      type="button"
      onClick={() => {
        startTransition(() => {
          router.refresh();
          revalidateRefresh([
            {
              originalPath: "/(protected)/(site)/[orgId]/[projectId]",
              type: "layout",
            },
            {
              originalPath: "/(protected)/(site)/[orgId]/[projectId]/[file]",
              type: "page",
            },
            {
              originalPath:
                "/(protected)/(site)/[orgId]/[projectId]/media/[path]",
              type: "page",
            },
          ]);
        });
      }}
    >
      <RotateCcw />
    </Button>
  );
}
