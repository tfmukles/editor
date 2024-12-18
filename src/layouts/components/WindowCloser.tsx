"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { startTransition, useEffect } from "react";

function WindowCloser() {
  const params = useSearchParams();
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined" && params.get("window") === "close") {
      window.close();
      startTransition(() => {
        router.refresh();
      });
    }
  }, [params, router]);

  return null;
}

export default WindowCloser;
