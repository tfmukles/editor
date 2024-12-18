"use client";

import { deleteOrg } from "@/actions/org";
import { Org } from "@/actions/org/types";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, ButtonProps } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useDialog } from "@/hooks/useDialog";
import { useSubmitForm } from "@/hooks/useSubmit";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function DeleteOrg({
  id,
  variant,
}: { id: string } & ButtonProps) {
  const [value, setValue] = useState("");
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { isOpen, onOpenChange } = useDialog();
  const { action } = useSubmitForm<Org<{ id: string }>>(deleteOrg, {
    onSuccess: ({ message }) => {
      toast({
        title: "delete organization successfully",
      });
      router.push("/");
    },
    onError: ({ message }) => {
      toast({
        title: message!,
      });
    },
  });

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          className="px-4 py-2"
          variant={variant}
          size={"lg"}
        >
          <Trash2 className="size-5 mr-1.5" />
          Delete Organization
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription className="grid gap-2">
            Deleting your organization will permanently delete all charts,
            people, sharing, and settings. This action cannot be undone.{" "}
            <Input
              type="text"
              placeholder="type CONFIRM to confirm"
              onChange={(e) => setValue(e.target.value)}
            />
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            onClick={async (e) => {
              e.preventDefault();
              startTransition(() => {
                action({ id });
              });
            }}
            type="button"
            variant={"destructive"}
            disabled={isPending || value !== "CONFIRM"}
          >
            Delete
            {isPending && <Loader2 className="ml-1 animate-spin h-4 w-4" />}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
