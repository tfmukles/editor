"use client";
import { forgetPassword } from "@/actions/user";
import { ForgetPassword as ForgetPasswordType } from "@/actions/user/types";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormInput,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useSubmitForm } from "@/hooks/useSubmit";
import { forgotPasswordSchema } from "@/lib/validate";
import Verify from "@/partials/Verify";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

export default function ForgetPassword() {
  const [isPending, startTransition] = useTransition();
  const [showVerify, setShowVerify] = useState(false);
  const forgetForm = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
  });
  const { action, state } = useSubmitForm<ForgetPasswordType>(forgetPassword, {
    onSuccess: ({ data }) => {
      setShowVerify(true);
    },
    onError: ({ message, error }) => {
      toast.error(message, {
        description: error.length > 0 && (
          <ul>
            {error.map((err) => (
              <li key={err.path}>{err.message}</li>
            ))}
          </ul>
        ),
      });
    },
  });

  return (
    <>
      {showVerify ? (
        <Verify
          {...forgetForm.getValues()}
          {...state}
          user_id={state.data?.id}
        />
      ) : (
        <>
          <CardHeader className="text-center pb-2">
            <CardTitle className="mb-6 font-semibold">
              Forgot Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...forgetForm}>
              <form
                className="text-left space-y-3 mt-4"
                onSubmit={forgetForm.handleSubmit((data) => {
                  startTransition(() => {
                    action({
                      email: data.email,
                      currentTime: Date.now(),
                    });
                  });
                })}
              >
                <FormField
                  control={forgetForm.control}
                  name={"email"}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <FormInput type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button className="w-full" disabled={isPending} type="submit">
                  Submit
                </Button>
              </form>
            </Form>
          </CardContent>
        </>
      )}
    </>
  );
}
