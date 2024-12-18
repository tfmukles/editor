"use client";

import { UserRegister } from "@/actions/user/types";
import { ExtractVariables, SubmitFormState } from "@/actions/utils";
import FormError from "@/components/form-error";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { registerSchema } from "@/lib/validate";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

export default function RegisterWithPassword({
  action,
  state,
}: {
  action: (
    data: ExtractVariables<UserRegister>,
  ) => Promise<SubmitFormState<UserRegister>>;
  state: SubmitFormState<UserRegister>;
}) {
  const [isPending, startTransition] = useTransition();
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      isTermsAccepted: false,
    },
  });

  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    startTransition(async () => {
      await action({
        ...data,
        currentDate: Date.now(),
      });
    });
  };

  return (
    <Form {...registerForm}>
      <form
        onSubmit={registerForm.handleSubmit(onSubmit)}
        className="text-left space-y-3 mt-4"
      >
        <FormField
          control={registerForm.control}
          name={"full_name"}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Full Name
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <FormInput placeholder="Enter full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={registerForm.control}
          name={"email"}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Email
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <FormInput {...field} placeholder="abc@example.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={registerForm.control}
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
                  placeholder="Enter password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-wrap items-center space-x-2 pt-1">
          <FormField
            control={registerForm.control}
            name={"isTermsAccepted"}
            render={({ field }) => (
              <FormItem>
                <div className="flex space-x-2 items-start">
                  <FormControl>
                    <Checkbox
                      className="mt-1"
                      onClick={() => {
                        field.onChange(!field.value);
                      }}
                      checked={field.value}
                      id="terms"
                    />
                  </FormControl>
                  <FormLabel
                    className="text-muted-foreground font-normal"
                    htmlFor="terms"
                  >
                    <span className="text-popover-foreground text-xs">
                      I have read and agree to the
                    </span>{" "}
                    <Button
                      className="inline px-0 text-accent-foreground font-normal text-xs"
                      asChild
                      variant={"link"}
                    >
                      <Link
                        href={"/"}
                        className="text-accent-foreground underline"
                      >
                        Privacy Policy
                      </Link>
                    </Button>{" "}
                    <span className="text-popover-foreground text-xs">and</span>{" "}
                    <Button
                      className="inline px-0 underline font-normal text-xs"
                      asChild
                      variant={"link"}
                    >
                      <Link href={"/"}>Terms of Service.</Link>
                    </Button>
                  </FormLabel>
                </div>

                <FormMessage className="flex-1 w-full" />
              </FormItem>
            )}
          />
        </div>

        <FormError {...state} />

        <Button disabled={isPending} type="submit" className="w-full mt-0">
          Register{" "}
          {isPending && <Loader2 className="animate-spin ml-2 h-4 w-4" />}
        </Button>
        <p className="text-center text-popover-foreground font-normal text-sm">
          Already have an account?{" "}
          <Button
            asChild
            className="underline p-0 h-auto text-accent-foreground text-sm"
            variant={"link"}
          >
            <Link href={"/login"}>Login</Link>
          </Button>
        </p>
      </form>
    </Form>
  );
}
