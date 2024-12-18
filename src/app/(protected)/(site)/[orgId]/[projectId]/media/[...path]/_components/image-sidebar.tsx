"use client";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ButtonProps } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { selectConfig } from "@/redux/features/config/slice";

import { useGetCommitQuery } from "@/redux/features/git/commitApi";
import { useGetImageQuery } from "@/redux/features/git/contentApi";
import { IFiles } from "@/types";
import { format } from "date-fns";
import path from "path";
import { useState } from "react";
import { useSelector } from "react-redux";
import Image from "./Image";
import Delete from "./file-delete";

export default function ImageSidebar({
  children,
  file: { isFile, name, path: filepath },
  ...props
}: {
  file: IFiles;
  children?: React.ReactNode;
} & ButtonProps) {
  const { branch, userName: owner, repo } = useSelector(selectConfig);
  const [selectedId, setSelectedImage] = useState<string | null>(null);
  const { data: commit } = useGetCommitQuery(
    { path: filepath.replace("media/", ""), sha: branch, owner, repo },
    {
      skip: !selectedId,
    },
  );

  const { data } = useGetImageQuery(
    {
      owner,
      repo,
      path: filepath.replace("media/", ""),
      ref: branch,
    },
    {
      skip: !selectedId,
    },
  );

  const date = commit?.[0]?.commit.author?.date;

  return (
    <Drawer
      {...(!isFile && { open: false })}
      direction="right"
      onClose={() => {
        setSelectedImage(null);
      }}
    >
      <DrawerTrigger
        {...props}
        onClick={() => {
          if (isFile) {
            setSelectedImage(filepath);
          }
        }}
      >
        {children}
      </DrawerTrigger>

      <DrawerContent className="max-w-[352px] bg-light items-start pt-10 px-8 target-alert-body overflow-y-auto">
        <DrawerHeader className="px-0 mb-1.5">
          <DrawerTitle className="text-primary">Attachment Details</DrawerTitle>
        </DrawerHeader>
        <AspectRatio ratio={4 / 3}>
          <Image className="h-full" src={filepath.replace("/media", "")} />
        </AspectRatio>

        <form className="w-full space-y-4 mt-6">
          <div>
            <Label>Name </Label>
            <Input readOnly value={path.parse(name).name} />
          </div>
          <div>
            <Label>Date </Label>
            <Input readOnly value={date ? format(date, "PPP") : "N/A"} />
          </div>
          <div>
            <Label>Size </Label>
            <Input
              readOnly
              value={`${Math.ceil((data?.size ?? 0) / 1024)} kb` || "N/A"}
            />
          </div>
        </form>
        <div className="flex-1 w-full flex justify-end pb-12">
          <Delete
            variant={"outline"}
            className="w-full border-destructive/30 hover:bg-destructive hover:text-destructive-foreground text-destructive mt-5 self-end"
            dir={filepath.replace("media/", "")}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
