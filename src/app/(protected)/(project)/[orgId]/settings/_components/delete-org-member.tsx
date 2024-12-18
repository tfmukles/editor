"use client";

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
import { useDialog } from "@/hooks/useDialog";
import { useState, useTransition } from "react";

export default function DeleteOrgMember({ action }: { action: () => void }) {
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const { isOpen, onOpenChange } = useDialog();

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        <Button
          className="block w-full text-left text-destructive hover:text-destructive"
          variant={"ghost"}
          disabled={isPending}
        >
          Delete User
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription className="grid gap-2">
            This action cannot be undone. This will permanently delete .
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
            disabled={isPending || value !== "CONFIRM"}
            variant={"destructive"}
            onClick={() => {
              startTransition(() => {
                action();
              });
            }}
          >
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
