"use client";

import { login } from "@/actions/user";
import { UserLogin } from "@/actions/user/types";
import FormError from "@/components/form-error";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormInput,
  FormInputPassword,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useSubmitForm } from "@/hooks/useSubmit";
import { loginSchema } from "@/lib/validate";
import Verify from "@/partials/Verify";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

export default function LoginWithPassword({
  toggleForm,
}: {
  toggleForm: () => void;
}) {
  const { toast } = useToast();
  const [showVerify, setShowVerify] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { action, state } = useSubmitForm<UserLogin>(login, {
    onSuccess: ({ message, data }) => {
      if (!data?.verified) {
        setShowVerify(true);
        toast({
          title: message!,
        });
      } else {
        signIn("credentials", {
          email: loginForm.getValues("email"),
          password: loginForm.getValues("password"),
          callbackUrl: "/",
        });
      }
    },
    openToast: false,
  });

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    startTransition(async () => {
      action({
        ...data,
        currentDate: Date.now(),
      });
    });
  };

  return !showVerify ? (
    <Form {...loginForm}>
      <form onSubmit={loginForm.handleSubmit(onSubmit)}>
        <CardHeader className="text-center pb-2">
          <CardTitle className="mb-6 font-semibold">Sign in </CardTitle>
        </CardHeader>

        <CardContent className="pb-2.5">
          <div className="space-y-4">
            <FormField
              control={loginForm.control}
              name={"email"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <FormInput
                      type="email"
                      {...field}
                      autoComplete="email"
                      placeholder="abc@example.com"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={loginForm.control}
              name={"password"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Password
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <FormInputPassword
                      type="password"
                      {...field}
                      placeholder="Password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormError {...state} />
          </div>
          <div className="text-right">
            <Button variant={"link"} asChild>
              <Link href={"/forgot-password"}>Forgot Password?</Link>
            </Button>
          </div>
        </CardContent>

        <CardFooter className="block text-center">
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Sign in..." : "Sign in"}
          </Button>
          <p className="text-center">
            <span className="text-popover-foreground text-sm">
              Don't have an account?
            </span>{" "}
            <Button
              asChild
              variant={"link"}
              className="underline-offset-4 px-0 text-sm text-accent-foreground"
            >
              <Link href={"/register"}>Sign Up for Free</Link>
            </Button>
          </p>
          <Button
            type="button"
            variant={"link"}
            className="text-primary group"
            onClick={toggleForm}
          >
            <ArrowLeft className="group-hover:-translate-x-1 mlr-1 size-5 transition-transform" />
            Other Sign options
          </Button>
        </CardFooter>
      </form>
    </Form>
  ) : (
    <Verify {...loginForm.getValues()} />
  );
}
