"use client";

import { updatePassword } from "@/actions/user";
import { UpdateUser } from "@/actions/user/types";
import FormError from "@/components/form-error";
import { Button } from "@/components/ui/button";

import {
  Form,
  FormControl,
  FormField,
  FormInputPassword,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useSubmitForm } from "@/hooks/useSubmit";
import { updatePasswordSchema } from "@/lib/validate";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

export default function UpdatePassword() {
  const { toast } = useToast();
  const { data } = useSession();
  const user = data?.user;
  const [isPending, startTransition] = useTransition();

  const updatePasswordForm = useForm<z.infer<typeof updatePasswordSchema>>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  const { action: updatePasswordAction, state } = useSubmitForm<UpdateUser>(
    updatePassword,
    {
      onSuccess: ({ message, data }) => {
        toast({
          description: "Password updated successfully",
        });
      },
    },
  );

  return (
    <Form {...updatePasswordForm}>
      <form
        onSubmit={updatePasswordForm.handleSubmit(
          (data) => {
            startTransition(() => {
              updatePasswordAction({
                user_id: user?.id!,
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
              });
            });
          },
          (err) => console.log(err),
        )}
        className="text-left space-y-4"
      >
        <FormField
          control={updatePasswordForm.control}
          name={"currentPassword"}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Current Password
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
          control={updatePasswordForm.control}
          name={"newPassword"}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                New Password
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <FormInputPassword type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormError {...state} />

        <div>
          <Button className="mt-4" disabled={isPending} type="submit">
            Update Password{" "}
            {isPending && <Loader2 className="animate-spin size-4" />}
          </Button>
        </div>
      </form>
    </Form>
  );
}
