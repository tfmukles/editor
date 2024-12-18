"use client";

import { deleteProject } from "@/actions/project";
import { Project } from "@/actions/project/types";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useDialog } from "@/hooks/useDialog";
import { useSubmitForm } from "@/hooks/useSubmit";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";

export default function DeleteSite({
  id,
  org_id,
}: {
  id: string;
  org_id: string;
}) {
  const { toast } = useToast();
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const { isOpen, onOpenChange } = useDialog();
  const { action: deleteAction } = useSubmitForm<
    Project<{ id: string; org_id: string }>
  >(deleteProject, {
    onSuccess: ({ message }) => {
      toast({
        title: message!,
      });
    },
    onError: (error) => {
      toast({
        title: error.message!,
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        <Button
          type="submit"
          variant="basic"
          className="text-destructive focus-within:outline-none focus-within:ring-0 !text-left w-full justify-start h-auto focus-visible:ring-0 focus-visible:outline-none focus-visible:ring-offset-0 !py-2 hover:bg-accent px-2"
        >
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription className="grid gap-2">
            This action cannot be undone. This will permanently delete your site
            and remove your data from our servers.
            <Input
              type="text"
              placeholder="type CONFIRM to confirm"
              onChange={(e) => setValue(e.target.value)}
            />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            variant={"destructive"}
            className="!py-0"
            disabled={isPending || value !== "CONFIRM"}
            onClick={() =>
              startTransition(() => {
                deleteAction({ id, org_id });
              })
            }
          >
            <span>Delete</span>
            {isPending && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
