"use client";

import { Card } from "@/components/ui/card";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh py-10 flex flex-col bg-light justify-center items-center">
      <h1 className="mb-10">Sitepins</h1>
      <Card className=" max-w-xs sm:max-w-md w-full border-0">{children}</Card>
    </div>
  );
}
