"use client";

import { updateProject } from "@/actions/project";
import { Project } from "@/actions/project/types";
import { updateImage } from "@/actions/user";
import Avatar from "@/components/avatar";
import FormError from "@/components/form-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormInput,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSubmitForm } from "@/hooks/useSubmit";
import { AcceptImages, MAX_SIZE } from "@/lib/constant";
import { projectSchema } from "@/lib/validate";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import z from "zod";

export default function EditOrg(project: Project) {
  const { org_id, project_id, project_name, project_image, ...rest } = project;
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [previewSrc, setPreviewSrc] = useState<string>();
  const projectForm = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      project_name,
      project_image,
      provider: rest.provider,
      branch: rest.branch,
      repository: rest.repository,
    },
  });

  const { getRootProps, getInputProps, open, fileRejections } = useDropzone({
    onDrop: (acceptedFiles) => {
      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        setPreviewSrc(event?.target?.result as string);
      };
      fileReader.readAsDataURL(acceptedFiles[0]);
      setFile(acceptedFiles[0]);
    },
    maxFiles: 1,
    maxSize: MAX_SIZE,
    accept: AcceptImages,
    noDrag: true,
    noClick: true,
  });

  const { action, state } = useSubmitForm<Project>(updateProject, {
    onSuccess: () => {
      setPreviewSrc(undefined);
      setFile(null);
      toast({
        title: "Site update successfully!",
      });
    },
    openToast: false,
  });

  return (
    <div className="p-8 2xl:px-14 2x:py-10">
      <Card>
        <CardHeader className="pb-6">
          <CardTitle>Site Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...projectForm}>
            <form
              className="space-y-4"
              onSubmit={projectForm.handleSubmit((data) => {
                startTransition(async () => {
                  let imageUrl = data.project_image;
                  if (file !== null) {
                    const formData = new FormData();
                    formData.append("permission", "public-read");
                    formData.append("folder", "cms/sites");
                    // @ts-ignore
                    formData.append("file", file);
                    const { data: imageInfo, error } =
                      await updateImage(formData);
                    if (imageInfo?.key) {
                      imageUrl = imageInfo.key;
                    }
                  }
                  action({
                    ...project,
                    project_name: data.project_name,
                    project_image: imageUrl,
                  });
                });
              })}
            >
              <div {...getRootProps}>
                <Label>
                  <h4 className="mb-3">Image</h4>
                </Label>
                <div className="flex items-center space-x-4">
                  <div className="size-[100px] rounded-full  flex items-center justify-center relative bg-light">
                    {previewSrc || project_image ? (
                      <Avatar
                        className="absolute top-0 left-0 w-full h-full flex-none rounded-full object-cover"
                        src={previewSrc! || project_image!}
                        preview={!!previewSrc}
                        alt={project_name}
                        width={200}
                        height={200}
                        email=""
                      />
                    ) : (
                      <p className="capitalize text-primary">
                        {project_name?.charAt(0)}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="mb-2 text-sm text-dark">
                      Make your org image unique by ad ding a photo.
                    </p>
                    <Button
                      className="relative text-dark border-dark"
                      variant={"outline"}
                      type="button"
                      onClick={open}
                    >
                      Change site profile
                      <Input
                        accept="image/jpg, image/jpeg, image/png"
                        type="file"
                        className="border-none absolute left-0 top-0 w-full h-full opacity-0 cursor-pointer"
                        {...getInputProps()}
                      />
                    </Button>
                    {fileRejections.length > 0 && (
                      <ul className="text-destructive font-medium text-sm">
                        {fileRejections.map((reject) => {
                          return reject.errors.map((err) => {
                            if (err.code === "file-too-large") {
                              return (
                                <li key={err.code}>
                                  File size exceeds the 10MB limit.
                                </li>
                              );
                            }
                            return <li key={err.code}>{err.message}</li>;
                          });
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              <FormField
                control={projectForm.control}
                name={"project_name"}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Site Name
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

              <div>
                <Button
                  disabled={isPending || fileRejections.length > 0}
                  className="mt-3.5"
                >
                  {isPending ? "Updating..." : "Update"}
                  {isPending && (
                    <Loader2 className="animate-spin ml-2 size-4" />
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
