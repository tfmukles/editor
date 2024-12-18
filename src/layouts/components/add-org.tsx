"use client";

import { addOrg } from "@/actions/org";
import { Org } from "@/actions/org/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormInput,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useDialog } from "@/hooks/useDialog";
import { useSubmitForm } from "@/hooks/useSubmit";
import { orgSchema } from "@/lib/validate";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import FormError from "./form-error";
import { Button, ButtonProps } from "./ui/button";

export default function AddOrg(props: ButtonProps) {
  const { toast } = useToast();
  const { isOpen, onOpenChange } = useDialog();
  const [isPending, startTransition] = useTransition();
  const { data } = useSession();
  const user = data?.user;

  const orgForm = useForm<z.infer<typeof orgSchema>>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      org_name: "",
      email: user?.email!,
    },
  });

  const { action, state } = useSubmitForm<Org>(addOrg, {
    onSuccess: ({ message }) => {
      onOpenChange();
      toast({
        description: message,
      });
      orgForm.reset();
    },

    openToast: false,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button {...props}>
          <span className="flex-none size-6 rounded-full flex text-xs items-center justify-center">
            <Plus className="size-3" />
          </span>
          <span className="flex-1 text-sm capitalize">Add New Org</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New organization</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <Form {...orgForm}>
            <form
              onSubmit={orgForm.handleSubmit((data) => {
                startTransition(() => {
                  action(data);
                });
              })}
              className="text-left space-y-6"
            >
              <FormField
                control={orgForm.control}
                name={"org_name"}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Organization Name
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <FormInput type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormError {...state} />

              <div className="text-right mt-3">
                <Button disabled={isPending} type="submit">
                  Create Organization
                  {isPending && <Loader2 className="animate-spin ml-2" />}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
