"use client";

import { fetchApi } from "@/actions/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState, useTransition } from "react";

export function Timer({ email }: { email: string }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [minutes, setMinutes] = useState(2);
  const [seconds, setSeconds] = useState(59);

  useEffect(() => {
    const interval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      }

      if (seconds === 0) {
        if (minutes === 0) {
          clearInterval(interval);
        } else {
          setSeconds(59);
          setMinutes(minutes - 1);
        }
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  });

  const sendOTP = async () => {
    setMinutes(2);
    setSeconds(59);
    startTransition(async () => {
      try {
        await fetchApi<{
          variables: {
            email: string;
            currentTime: number;
          };
        }>({
          endPoint: "/authentication/resend-otp",
          method: "POST",
          body: {
            email,
            currentTime: Date.now(),
          },
          cache: "no-cache",
        });
      } catch (error: any) {
        toast({
          title: error.message || "Something went Wrong!",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Button
      className="inline text-muted-foreground disabled:text-muted-foreground p-0"
      type="button"
      variant={"link"}
      onClick={sendOTP}
      disabled={minutes !== 0 || seconds !== 0 || isPending}
    >
      Resend
      {(seconds > 0 || minutes > 0) && (
        <span className="text-inherit">
          ({minutes < 10 ? `0${minutes}` : minutes}:
          {seconds < 10 ? `0${seconds}` : seconds})
        </span>
      )}
    </Button>
  );
}
