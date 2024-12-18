"use client";

import { Button, ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useDialog } from "@/hooks/useDialog";
import { selectConfig } from "@/redux/features/config/slice";
import { useUpdateFilesMutation } from "@/redux/features/git/commitApi";
import { excludeMedia } from "@/redux/features/media-manager/slice";
import { useAppDispatch } from "@/redux/store";
import { Loader2, Trash2 } from "lucide-react";
import { useSelector } from "react-redux";

export default function Delete({
  dir,
  ...props
}: ButtonProps & { dir: string }) {
  const config = useSelector(selectConfig);
  const dispatch = useAppDispatch();
  const { isOpen, onOpenChange } = useDialog();
  const { toast } = useToast();
  const [deleteFiles, { isLoading: isPending }] = useUpdateFilesMutation();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button {...props}>
          <Trash2 className="size-4 mr-1.5" />
          <span>Delete</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-[288px] w-full [&_[aria-label='close']]:hidden py-8 px-14 top-[30%]"
        target={document.querySelector(".target-alert-body") as HTMLElement}
      >
        <DialogHeader className="text-center">
          <DialogTitle className="text-center">Delete Image</DialogTitle>
          <DialogDescription className="text-sm text-center">
            Are you sure you want to delete this Image?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="!justify-center">
          <DialogClose asChild>
            <Button className="border border-border" variant={"basic"}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant={"destructive"}
            onClick={async () => {
              deleteFiles({
                files: [{ path: dir, content: "" }],
                message: `delete image: ${dir}`,
                owner: config.userName,
                repo: config.repo,
                tree: config.branch,
              }).then((res) => {
                if (!res.error?.message) {
                  toast({
                    description: "Image deleted successfully",
                  });
                  onOpenChange();
                  dispatch(excludeMedia(`media/${dir}`));
                }
              });
            }}
            disabled={isPending}
          >
            Delete{" "}
            {isPending && <Loader2 className="animate-spin ml-2 h-4 w-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
