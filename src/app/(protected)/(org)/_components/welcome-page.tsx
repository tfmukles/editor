"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { siteCreateStep } from "./data";
import StartingPage from "./starting-page";

export default function WelcomePage({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data } = useSession();
  const [started, setStarted] = useState(false);
  if (started) {
    return <StartingPage>{children}</StartingPage>;
  }
  return (
    <div className="flex-1 flex flex-col items-center justify-center space-y-8">
      <div className="text-center max-w-sm">
        <h1 className="mb-2">
          Hi {data?.user.userName}, Welcome to Sitepins 👋
        </h1>
        <p className="text-sm text-foreground">
          We're glad to have you onboard! Let's get started creating your first
          website.
        </p>
      </div>
      <Card className="max-w-lg w-full">
        <CardHeader className="pb-5">
          <CardTitle className="text-center text-h4">
            We'll create your first site in 3 steps:
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <ol className="list-decimal space-y-1.5 inline-block mx-auto pl-5">
              {siteCreateStep.map((step) => (
                <li key={step} className="text-left text-sm text-foreground">
                  {step}
                </li>
              ))}
            </ol>

            <Button
              onClick={() => setStarted(true)}
              className="w-full mt-8 block"
            >
              Get Started
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
