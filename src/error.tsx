"use client";

import { Button } from "@/components/ui/button";
import Header from "@/partials/Header";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { startTransition } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string; message?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const session = useSession();

  const resetAndReload = () => {
    startTransition(() => {
      router.refresh();
      reset();
    });
  };

  const expirationDateString = session.data?.expires ?? "";

  const expirationDate = new Date(expirationDateString);

  const currentDate = new Date();

  if (expirationDate < currentDate) {
    signOut();
    return null;
  }

  return (
    <>
      <Header />
      <div className="h-screen">
        <div className="h-full flex justify-center items-center flex-col">
          <div className="bg-accent shadow rounded-lg p-20 border max-w-3xl w-full text-center">
            <h2 className="mb-3 text-base">
              {/* @ts-ignore */}
              {error.message || error || "Something went wrong!"}
            </h2>
            <Button type="button" onClick={resetAndReload}>
              Try again
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
