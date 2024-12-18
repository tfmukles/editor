"use client";

import { logout } from "@/actions/user";
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
import { useSubmitForm } from "@/hooks/useSubmit";
import { cn } from "@udecode/cn";
import { UserCog } from "lucide-react";
import { useTransition } from "react";
import { Button } from "./ui/button";

export default function Logout() {
  const [isPending, startTransition] = useTransition();
  // @ts-ignore
  const { action } = useSubmitForm(logout);

  return (
    <li>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            type="submit"
            variant={"secondary"}
            className={cn("flex items-center py-3 px-2.5 rounded-lg")}
          >
            <UserCog className="w-[22px] h-[22px] mr-3" />
            <span>Logout</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to logout??
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              type="button"
              onClick={() => {
                startTransition(() => {
                  // @ts-ignore
                  action();
                });
              }}
              disabled={isPending}
            >
              Yes sure
            </Button>

            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}
