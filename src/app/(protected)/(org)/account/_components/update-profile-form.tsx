"use client";

import { updateImage, updateUser } from "@/actions/user";
import { UserUpdate } from "@/actions/user/types";
import Avatar from "@/components/avatar";
import FormError from "@/components/form-error";
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
import { useSubmitForm } from "@/hooks/useSubmit";
import { userDetailsSchema } from "@/lib/validate";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function UserDetailsForm({
  userName,
  country,
  profession,
  image,
  id: userId,
}: User) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [previewSrc, setPreviewSrc] = useState<string>();
  const { data: session, update, status } = useSession();
  const [file, setFile] = useState<File | null>(null);

  const userDetailsForm = useForm<z.infer<typeof userDetailsSchema>>({
    resolver: zodResolver(userDetailsSchema),
    defaultValues: {
      full_name: userName || "",
      country: country || "",
      profession: profession || "",
      image: image || "",
    },
  });

  const { action, state } = useSubmitForm<UserUpdate>(updateUser, {
    onSuccess: ({ message, data }) => {
      const { full_name, image, profession, country } = data || {};
      toast({
        description: "User details updated successfully",
      });
      userDetailsForm.reset();
      setPreviewSrc("");
      update({
        fullName: full_name,
        image,
        profession,
        country,
      });
      userDetailsForm.setValue("full_name", full_name!);
      userDetailsForm.setValue("image", image);
      userDetailsForm.setValue("profession", profession);
      userDetailsForm.setValue("country", country);
    },
    openToast: false,
  });

  return (
    <Form {...userDetailsForm}>
      <form
        className="w-full space-y-4"
        onSubmit={userDetailsForm.handleSubmit(
          async (data) => {
            startTransition(async () => {
              let imageUrl = image;
              if (file !== null) {
                const formData = new FormData();
                formData.append("permission", "public-read");
                formData.append("folder", "cms/users");
                // @ts-ignore
                formData.append("file", file);
                const { data: imageInfo } = await updateImage(formData);

                if (imageInfo?.key) {
                  imageUrl = imageInfo.key;
                }
              }

              action({
                full_name: data.full_name,
                user_id: userId!,
                country: data.country,
                image: imageUrl!,
                profession: data.profession,
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
              {previewSrc || userDetailsForm.getValues("image") ? (
                <Avatar
                  className="absolute top-0 left-0 w-full h-full flex-none rounded-full object-cover"
                  src={previewSrc! || userDetailsForm.getValues("image")!}
                  preview={!!previewSrc}
                  alt={userName!}
                  width={200}
                  height={200}
                  email=""
                />
              ) : (
                <p className="capitalize text-primary">{userName?.charAt(0)}</p>
              )}
            </div>
            <div>
              <p className="mb-2 text-sm text-dark">
                Make your avatar unique by adding a photo.
              </p>
              <Button
                className="relative text-dark border-dark"
                variant={"outline"}
              >
                Change profile
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

        <div className="space-y-4">
          <h5 className="font-semibold">Personal Information</h5>
          <div className="grid gap-4">
            <FormField
              control={userDetailsForm.control}
              name={"full_name"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={userDetailsForm.control}
              name={"country"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={userDetailsForm.control}
              name={"profession"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profession</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormError {...state} />

        <div>
          <Button className="mt-4" disabled={isPending} type="submit">
            Update Account
            {isPending && <Loader2 className="animate-spin ml-1" />}
          </Button>
        </div>
      </form>
    </Form>
  );
}
