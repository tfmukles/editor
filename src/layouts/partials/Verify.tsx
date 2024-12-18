"use client";

import { resetPassword, verifyEmail } from "@/actions/user";
import { ResetPassword, UserVerified } from "@/actions/user/types";
import { REGEXP_ONLY_DIGITS } from "input-otp";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormInputPassword,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useSubmitForm } from "@/hooks/useSubmit";
import { conformPasswordSchema, otpSchema } from "@/lib/validate";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@udecode/cn";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Timer } from "./Timer";

export default function Verify({
  email,
  password,
  user_id,
}: {
  email: string;
  password?: string;
  user_id?: string;
}) {
  const { toast } = useToast();
  const [isVerified, setIsVerified] = useState(false);
  const [isPending, startTransition] = useTransition();
  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const confirmPasswordForm = useForm<z.infer<typeof conformPasswordSchema>>({
    resolver: zodResolver(conformPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const { action } = useSubmitForm<UserVerified>(verifyEmail, {
    onSuccess: ({ message }) => {
      toast({
        title: message!,
      });
      if (password) {
        signIn("credentials", {
          email,
          password,
          callbackUrl: "/",
        });
      } else {
        setIsVerified(true);
      }
    },
    onError: ({ message, error }) => {
      toast({
        variant: "destructive",
        title: message!,
      });
    },
  });

  const { action: resetAction } = useSubmitForm<ResetPassword>(resetPassword, {
    onSuccess: ({ message, data }) => {
      toast({
        title: message!,
      });

      signIn("credentials", {
        email: email,
        password: confirmPasswordForm.getValues("password"),
      });
    },
    onError: ({ message, error }) => {
      toast({
        variant: "destructive",
        title: message!,
      });
    },
  });

  const onSubmit = async (data: z.infer<typeof otpSchema>) => {
    startTransition(async () => {
      try {
        action({ ...data, email });
      } catch (error: any) {
        toast({
          title: error.message || "Something went Wrong!",
          variant: "destructive",
        });
      }
    });
  };

  return isVerified ? (
    <>
      <CardHeader className="text-center pb-6">
        <CardTitle className="font-semibold">Reset Password</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...confirmPasswordForm}>
          <form
            onSubmit={confirmPasswordForm.handleSubmit((data) => {
              startTransition(() => {
                resetAction({
                  email,
                  user_id: user_id!,
                  password: data.password,
                  confirmPassword: data.confirmPassword,
                });
              });
            })}
            className="text-left space-y-3"
          >
            <FormField
              control={confirmPasswordForm.control}
              name={"password"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Password
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <FormInputPassword type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={confirmPasswordForm.control}
              name={"confirmPassword"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Confirm Password
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <FormInputPassword type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={isPending} type="submit" className="w-full">
              Submit{" "}
              {isPending && <Loader2 className="animate-spin ml-2 h-4 w-4" />}
            </Button>
          </form>
        </Form>
      </CardContent>
    </>
  ) : (
    <>
      <CardHeader className="text-center pb-6">
        <CardTitle>We sent a OTP to your email</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4 mb-3">
          <p className="text-sm text-foreground/70">
            To continue, please enter the 4-digit verification code sent to your
            email .
          </p>
          <p className="text-sm text-foreground/70">
            Didn't receive a code? <Timer email={email} />
          </p>
        </div>
        <Form {...otpForm}>
          <form
            onSubmit={otpForm.handleSubmit(onSubmit)}
            className="text-left space-y-3"
          >
            <div className="mb-4">
              <FormField
                control={otpForm.control}
                name={"otp"}
                render={({ field }) => {
                  const { error } = useFormField();
                  return (
                    <FormItem>
                      <FormControl>
                        <InputOTP
                          maxLength={4}
                          pattern={REGEXP_ONLY_DIGITS}
                          {...field}
                        >
                          <InputOTPGroup className="mx-auto space-x-1">
                            <InputOTPSlot
                              className={cn(error && "border-destructive")}
                              index={0}
                            />
                            <InputOTPSlot
                              className={cn(error && "border-destructive")}
                              index={1}
                            />
                            <InputOTPSlot
                              className={cn(error && "border-destructive")}
                              index={2}
                            />
                            <InputOTPSlot
                              className={cn(error && "border-destructive")}
                              index={3}
                            />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                    </FormItem>
                  );
                }}
              />
            </div>
            <Button disabled={isPending} type="submit" className="w-full">
              Continue
            </Button>
          </form>
        </Form>
      </CardContent>
    </>
  );
}
