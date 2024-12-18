"use client";

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useDialog } from "@/hooks/useDialog";
import { findFileByPath, sanitizedPath } from "@/lib/utils/common";
import { createFileSchema } from "@/lib/validate";
import { selectConfig } from "@/redux/features/config/slice";
import { useUpdateFilesMutation } from "@/redux/features/git/commitApi";
import {
  useGetContentQuery,
  useGetTreesQuery,
} from "@/redux/features/git/contentApi";
import { githubApi } from "@/redux/features/git/gitApi";
import { useAppDispatch } from "@/redux/store";
import { IFiles } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import path from "path";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { z } from "zod";

type Props = {
  files?: IFiles[];
  title: string;
  path: string;
  children: React.ReactNode;
  operation?: "delete" | "rename" | "create" | "duplicate";
  media?: boolean;
  callback?: () => void;
};

const actionLabels = {
  delete: "Delete",
  rename: "Rename",
  create: "Create",
  duplicate: "Duplicate",
};

export function FileOperation({
  operation,
  title,
  path: filepath,
  children,
  files,
}: Props) {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const config = useSelector(selectConfig);
  const { name: fileName } = path.parse(filepath);
  const { isOpen, onOpenChange } = useDialog();
  const [updateFle, { isLoading: isPending }] = useUpdateFilesMutation();
  const editFileForm = useForm<z.infer<typeof createFileSchema>>({
    resolver: zodResolver(createFileSchema),
    defaultValues: {
      name: fileName,
    },
  });

  const { data } = useGetTreesQuery({
    owner: config.userName,
    repo: config.repo,
    tree_sha: config.branch,
    recursive: "1",
  });

  const trees = data?.trees ?? [];
  const { data: content } = useGetContentQuery({
    owner: config.userName,
    repo: config.repo,
    path: filepath,
    ref: config.branch,
  });

  const onRename = async (data: z.infer<typeof createFileSchema>) => {
    const { dir, ext } = path.parse(filepath);
    updateFle({
      files: [
        {
          path: filepath,
          content: "",
        },
        {
          path: `${dir}/${data.name}${ext}`,
          content: content?.data as string,
        },
      ],
      message: `Rename file ${fileName}`,
      owner: config.userName,
      repo: config.repo,
      tree: config.branch,
    }).then((res) => {
      if (!res.error?.message) {
        dispatch(
          githubApi.util.invalidateTags([
            {
              type: "Files",
              id: "LIST",
            },
          ]),
        );
        toast({
          title: "File renamed successfully",
        });
        onOpenChange(false);
      }
    });
  };

  if (operation === "rename") {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button
            className="relative flex cursor-default select-none items-center justify-start px-2 py-1.5 w-full text-left focus-visible:outline-none focus-visible:ring-0 "
            variant="ghost"
          >
            {children}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="break-all">
              {actionLabels[operation!]}
            </DialogTitle>
            <DialogDescription>{title}</DialogDescription>
          </DialogHeader>
          <Form {...editFileForm}>
            <form
              className="grid gap-3"
              onSubmit={editFileForm.handleSubmit(async (data, event) => {
                event?.preventDefault();
                const isAlreadyExit = files?.some((item) => {
                  return (
                    path.parse(item.name).name.toLowerCase() ===
                    data.name.toLocaleLowerCase()
                  );
                });
                if (isAlreadyExit) {
                  toast({
                    variant: "destructive",
                    title: "File already exists",
                  });
                } else {
                  onRename(data);
                }
              })}
            >
              <div className="grid flex-1 gap-2">
                <Label htmlFor="name" className="sr-only">
                  file name
                </Label>

                <FormField
                  control={editFileForm.control}
                  name={"name"}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Name:</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter file name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className="sm:justify-end">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button disabled={isPending} type="submit" variant="default">
                  Save
                  {isPending && (
                    <Loader2 className="ml-1 animate-spin h-4 w-4" />
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  }

  const [value, setValue] = useState<string>(
    process.env.NODE_ENV === "development" ? "CONFIRM" : "",
  );

  const onDelete = async () => {
    updateFle({
      files: [
        {
          path: filepath,
          content: "",
        },
      ],
      message: `Delete file ${fileName}`,
      owner: config.userName,
      repo: config.repo,
      tree: config.branch,
    }).then((res) => {
      if (!res.error?.message) {
        toast({
          title: "File deleted successfully!",
        });
        dispatch(
          githubApi.util.invalidateTags([
            {
              type: "Files",
              id: "LIST",
            },
          ]),
        );
        onOpenChange(false);
      }
    });
  };

  const onDuplicate = async () => {
    const { dir, name, ext } = path.parse(filepath);
    const currentFolderFiles = findFileByPath(
      trees![0].children!,
      sanitizedPath("files", dir),
    )?.children?.filter((file) => file.name.includes(name));

    const number: number = Math.max(
      ...(currentFolderFiles?.reduce<number[]>(
        (acc, curr) => {
          const regex = /_copy_(\d+)/;
          const fileName = path.parse(curr.path).name;
          const match = fileName.match(regex);
          if (match) {
            const [, number] = match;
            const extractedNumber = number ? parseInt(number, 10) : 0;
            return [...acc, extractedNumber];
          }
          return acc;
        },
        [0],
      ) || [0]),
    );

    const newPath = `${dir}/${name.replace(/_copy_(\d+)/, "")}_copy_${number + 1}${ext}`;
    updateFle({
      files: [
        {
          path: newPath,
          content: content?.data!,
        },
      ],
      message: `Duplicate file ${name}`,
      owner: config.userName,
      repo: config.repo,
      tree: config.branch,
    }).then((res) => {
      if (!res.error?.message) {
        toast({
          title: "File duplicated successfully!",
        });
        dispatch(
          githubApi.util.invalidateTags([
            {
              type: "Files",
              id: "LIST",
            },
          ]),
        );
        onOpenChange(false);
      }
    });
  };

  if (operation === "duplicate") {
    return (
      <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
        <AlertDialogTrigger asChild>
          <Button
            className="relative flex cursor-default select-none items-center justify-start px-2 py-1.5 w-full text-left focus-visible:outline-none focus-visible:ring-0"
            variant="ghost"
          >
            {children}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{actionLabels[operation!]}</AlertDialogTitle>
            <AlertDialogDescription className="grid gap-2">
              {title}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <Button
              onClick={async (e) => {
                e.preventDefault();
                onDuplicate();
              }}
              type="button"
              disabled={isPending}
            >
              {actionLabels[operation!]}
              {isPending && <Loader2 className="ml-1 animate-spin h-4 w-4" />}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        <Button
          className="relative flex cursor-default select-none items-center justify-start px-2 py-1.5 w-full text-left focus-visible:outline-none focus-visible:ring-0"
          variant="ghost"
        >
          {children}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{actionLabels[operation!]}</AlertDialogTitle>
          <AlertDialogDescription className="grid gap-2">
            {title}

            <Input
              type="text"
              placeholder="type CONFIRM to confirm"
              onChange={(e) => setValue(e.target.value)}
              value={value}
            />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            onClick={async (e) => {
              e.preventDefault();
              operation === "delete" ? onDelete() : onDuplicate();
            }}
            {...(operation === "delete" && {
              variant: "destructive",
            })}
            type="button"
            disabled={isPending || value !== "CONFIRM"}
          >
            {actionLabels[operation!]}
            {isPending && <Loader2 className="ml-1 animate-spin h-4 w-4" />}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
