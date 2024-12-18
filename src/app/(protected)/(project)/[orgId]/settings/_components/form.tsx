"use client";

import { updateOrg } from "@/actions/org";
import { Org } from "@/actions/org/types";
import { updateImage } from "@/actions/user";
import Avatar from "@/components/avatar";
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
import { addNewTeamMemberSchema, updateOrgSchema } from "@/lib/validate";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

export default function EditOrg(org: Org) {
  const { toast } = useToast();
  const { org_name, org_image, org_id } = org;
  const [file, setFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const [previewSrc, setPreviewSrc] = useState<string>();
  const orgForm = useForm<z.infer<typeof updateOrgSchema>>({
    resolver: zodResolver(updateOrgSchema),
    defaultValues: {
      org_name,
      org_image,
    },
  });

  const addTeamMemberForm = useForm<z.infer<typeof addNewTeamMemberSchema>>({
    resolver: zodResolver(addNewTeamMemberSchema),
    defaultValues: {
      email: "",
    },
  });

  const { action } = useSubmitForm<Org>(updateOrg, {
    onSuccess: ({ data }) => {
      toast({
        description: "Update org successfully",
      });
      setPreviewSrc(undefined);
      orgForm.reset({
        org_name: data?.org_name,
        org_image: data?.org_image,
      });
      addTeamMemberForm.reset();
    },
    openToast: false,
  });

  return (
    <Card>
      <CardHeader className="pb-6">
        <CardTitle>Org Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...orgForm}>
          <form
            className="space-y-4"
            onSubmit={orgForm.handleSubmit(
              (data) => {
                startTransition(async () => {
                  let imageUrl = data.org_image;
                  if (file !== null) {
                    const formData = new FormData();
                    formData.append("permission", "public-read");
                    formData.append("folder", "cms/orgs");
                    // @ts-ignore
                    formData.append("file", file);
                    const { data: imageInfo } = await updateImage(formData);

                    if (imageInfo?.key) {
                      imageUrl = imageInfo.key;
                    }
                  }

                  // @ts-ignore
                  action({
                    org_id: org_id,
                    org_name: data.org_name,
                    org_image: imageUrl,
                  });
                });
              },
              (err) => {
                console.log(err);
              },
            )}
          >
            <div>
              <Label>
                <h4 className="mb-3">Image</h4>
              </Label>
              <div className="flex items-center space-x-4">
                <div className="size-[100px] rounded-full  flex items-center justify-center relative bg-light">
                  {previewSrc || org_image ? (
                    <Avatar
                      className="absolute top-0 left-0 w-full h-full flex-none rounded-full object-cover"
                      src={previewSrc! || org_image!}
                      preview={!!previewSrc}
                      alt={org_name}
                      width={200}
                      height={200}
                      email=""
                    />
                  ) : (
                    <p className="capitalize text-primary">
                      {org_name?.charAt(0)}
                    </p>
                  )}
                </div>
                <div>
                  <Button
                    className="relative text-dark border-dark"
                    variant={"outline"}
                  >
                    Change site profile
                    <Input
                      accept="image/jpg, image/jpeg, image/png"
                      type="file"
                      className="border-none absolute left-0 top-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (!files) return;
                        const fileReader = new FileReader();
                        fileReader.onload = (event) => {
                          setPreviewSrc(event?.target?.result as string);
                        };
                        fileReader.readAsDataURL(files[0]);
                        setFile(files[0]);
                      }}
                    />
                  </Button>
                </div>
              </div>
            </div>

            <FormField
              control={orgForm.control}
              name={"org_name"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Org Name
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <FormInput type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <Button disabled={isPending} className="mt-3.5">
                Update
                {isPending && <Loader2 className="animate-spin ml-2 size-4" />}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
