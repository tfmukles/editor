"use client";

import { convertToFormData } from "@/components/SchemaGenerate";
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
import { contentFormatter } from "@/lib/utils/contentFormatter";
import { isGroupNameExit } from "@/lib/utils/is-group-exit";
import { slugify } from "@/lib/utils/textConverter";
import { createFileSchema } from "@/lib/validate";
import { selectConfig } from "@/redux/features/config/slice";
import { useUpdateFilesMutation } from "@/redux/features/git/commitApi";
import { useGetContentQuery } from "@/redux/features/git/contentApi";
import { githubApi } from "@/redux/features/git/gitApi";
import { useAppDispatch } from "@/redux/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import path from "path";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import * as z from "zod";

type Props = {
  targetPath: string;
  folderName?: string;
  schemaDir?: string;
} & ButtonProps;

export default function CreateNewFile({
  targetPath,
  folderName,
  schemaDir,
  ...props
}: Props) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { toast } = useToast();
  const pathname = usePathname();
  const config = useSelector(selectConfig);
  const { isOpen, onOpenChange } = useDialog();
  const { data: schema } = useGetContentQuery({
    owner: config.userName,
    repo: config.repo,
    path: `${schemaDir}`,
    ref: config.branch,
    parser: true,
  });
  const schemaData = schema?.data;
  const createFileForm = useForm<z.infer<typeof createFileSchema>>({
    resolver: zodResolver(createFileSchema),
    defaultValues: {
      name: "",
      title: "",
    },
  });

  const [createNewFile, { isLoading: isPending }] = useUpdateFilesMutation();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button {...props} disabled={!schema}>
          <span className="flex-none size-6 rounded-full flex text-xs items-center justify-center">
            <Plus className="size-3" />
          </span>
          <span className="flex-1 text-sm capitalize">New {folderName}</span>
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Post</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <Form {...createFileForm}>
            <form
              onSubmit={createFileForm.handleSubmit(async (data) => {
                const filepath = isGroupNameExit(pathname, config);
                const newFileText = contentFormatter({
                  data: convertToFormData(schemaData?.template, data.title),
                  page_content: "",
                  format: schemaData?.fmType,
                });

                createNewFile({
                  owner: config.userName,
                  repo: config.repo,
                  tree: config.branch,
                  files: [
                    {
                      path: path.join(
                        filepath,
                        slugify(data.name) + "." + schemaData?.fileType,
                      ),
                      content: newFileText,
                    },
                  ],
                  message: `Create new ${folderName}`,
                }).then((res) => {
                  if (!res.error?.message) {
                    toast({ title: "File created successfully" });
                    createFileForm.reset();
                    dispatch(
                      githubApi.util.invalidateTags([
                        {
                          type: "Files",
                          id: "LIST",
                        },
                      ]),
                    );
                    router.push(
                      `${pathname}/${slugify(data.name) + "." + schemaData?.fileType}`,
                    );
                  }
                });
              })}
              className="space-y-4"
            >
              <FormField
                control={createFileForm.control}
                name={"title"}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          createFileForm.setValue(
                            "name",
                            slugify(e.target.value),
                          );
                        }}
                        type="text"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createFileForm.control}
                name={"name"}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input {...field} type="text" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                disabled={isPending}
                type="submit"
                className="w-full flex"
              >
                <span> {isPending ? "Creating..." : "Create"}</span>
                {isPending && <Loader2 className="animate-spin ml-2" />}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
