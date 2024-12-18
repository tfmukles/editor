"use client";

import { register } from "@/actions/user";
import { UserRegister } from "@/actions/user/types";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useSubmitForm } from "@/hooks/useSubmit";
import Verify from "@/partials/Verify";
import { signIn } from "next-auth/react";
import { useState } from "react";
import RegisterWithPassword from "./_components/register-with-password";

export default function Register() {
  const { toast } = useToast();
  const [showVerify, setShowVerify] = useState(false);

  const { action, state } = useSubmitForm<UserRegister>(register, {
    openToast: false,
    onSuccess: () => {
      toast({
        title: "Registration Successful",
      });
      setShowVerify(true);
    },
  });

  return showVerify ? (
    <Verify email={state.data?.email!} password={state.data?.password!} />
  ) : (
    <>
      <CardHeader className="text-center pb-2">
        <CardTitle className="mb-6 font-semibold">Create an account</CardTitle>
        <div className="space-y-2">
          <Button
            type="button"
            variant={"secondary"}
            className="w-full border border-border"
            onClick={() => signIn("github")}
          >
            <Icons.githubBlack className="size-5" />
            <span className="ml-2 ">Sign up with GitHub</span>
          </Button>
          <Button
            type="button"
            variant={"secondary"}
            className="w-full border-border border"
            onClick={() => signIn("google")}
          >
            <Icons.google className="size-5" />
            <span className="ml-2">Sign up with Google</span>
          </Button>
          <div className="flex items space-x-3 items-center pt-3">
            <Separator className="flex-1" />
            <p className="text-sm flex-1 whitespace-nowrap text-muted-foreground bg-card inline-block">
              or continue with email
            </p>
            <Separator className="flex-1" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <RegisterWithPassword state={state} action={action} />
      </CardContent>
    </>
  );
}
