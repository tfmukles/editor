"use client";

import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "./ui/button";

type Props = {
  folderName: string;
  permission: string;
  disabled?: boolean;
  name: string;
  image?: string;
};

const UploadImage = ({ image, name }: Props) => {
  const [previewSrc, setPreviewSrc] = useState<string>();
  return (
    <div className="flex w-full items-center space-x-3 rounded-lg border border-border p-4">
      <div className="flex items-center gap-4">
        <div className="size-[72px] bg-light grid place-items-center rounded-full relative">
          {previewSrc || image ? (
            <img
              src={previewSrc ? previewSrc : (image as string)}
              width={72}
              height={72}
              className="rounded-full overflow-hidden absolute inset-0 object-cover w-full h-full z-30"
              alt={name}
            />
          ) : (
            <p className="capitalize">{name.charAt(0)}</p>
          )}
        </div>
        <div>
          <Button variant={"outline"} className="relative">
            Change your profile
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
              }}
            />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UploadImage;
