"use client";

import FormError from "@/components/form-error";
import { Button, ButtonProps } from "@/components/ui/button";
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
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useDialog } from "@/hooks/useDialog";
import { createFileSchema as createFolderSchema } from "@/lib/validate";
import { selectConfig } from "@/redux/features/config/slice";
import { useUpdateFilesMutation } from "@/redux/features/git/commitApi";
import {
  addNewMedia,
  selectMediaInfo,
} from "@/redux/features/media-manager/slice";
import { useAppDispatch } from "@/redux/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { FolderIcon, Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import * as z from "zod";

export default function CreateFolder(props: ButtonProps) {
  const config = useSelector(selectConfig);
  const pathname = usePathname();
  const { toast } = useToast();
  const { media } = useSelector(selectMediaInfo);
  const dispatch = useAppDispatch();
  const folderCreateForm = useForm<z.infer<typeof createFolderSchema>>({
    resolver: zodResolver(createFolderSchema),
    defaultValues: {
      name: "",
    },
  });

  const folderName = folderCreateForm.watch("name");
  const { isOpen, onOpenChange } = useDialog();
  const [createNewFolder, { isLoading: isPending, error, isError }] =
    useUpdateFilesMutation();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" {...props}>
          <FolderIcon className="size-4 mr-1.5" />
          <span>New Folder</span>
        </Button>
      </DialogTrigger>
      <DialogContent disableClose={isPending} className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">New Folder</DialogTitle>
        </DialogHeader>
        <Form {...folderCreateForm}>
          <form
            className="space-y-3 block"
            onSubmit={folderCreateForm.handleSubmit(async (data) => {
              const index = media.findIndex((file) => file.name === folderName);
              if (index > -1) {
                toast({
                  variant: "destructive",
                  description: "Folder already exists",
                });
              } else {
                const folder = pathname!.split("media/")?.[1];
                const newFolder = folder + "/" + data.name;
                createNewFolder({
                  files: [
                    {
                      path: newFolder + "/" + ".gitkeep",
                      content: "",
                    },
                  ],
                  message: `Create folder ${data.name}`,
                  owner: config.userName,
                  repo: config.repo,
                  tree: config.branch,
                }).then((res) => {
                  if (!res.error?.message) {
                    dispatch(
                      addNewMedia([
                        {
                          isFile: false,
                          name: folderName,
                          // @ts-ignore
                          path: `media/${newFolder}`,
                          sha: null,
                          isNew: true,
                        },
                      ]),
                    );
                    toast({
                      variant: "default",
                      description: "Folder created successfully",
                    });
                    onOpenChange();
                  }
                });
              }
            })}
          >
            <FormField
              control={folderCreateForm.control}
              name={"name"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Folder Name
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormError isError={isError} message={error?.message!} error={[]} />

            <div className="text-right">
              <Button
                size={"lg"}
                className="mt-6"
                disabled={isPending}
                type="submit"
              >
                Create
                {isPending && (
                  <Loader2 className="inline-block ml-1 text-xl animate-spin size-4" />
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
