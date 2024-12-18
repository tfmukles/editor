"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import dateFormat from "@/lib/utils/dateFormat";
import { slugify } from "@/lib/utils/textConverter";
import { selectConfig } from "@/redux/features/config/slice";
import { useGetCommitQuery } from "@/redux/features/git/commitApi";
import { useGetContentQuery } from "@/redux/features/git/contentApi";
import { IFiles } from "@/types";
import { useInView } from "framer-motion";
import { CopyIcon, Edit2Icon, EllipsisVertical, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import path from "path";
import { useRef } from "react";
import { useSelector } from "react-redux";
import { FileOperation } from "./file-operation";

export default function FileRow({ file }: { file: IFiles }) {
  const config = useSelector(selectConfig);
  const pathname = usePathname();
  const container = useRef<HTMLDivElement>(null);
  const fileName = file.path.replace("files/", "");
  const arrangement = config?.arrangement.find(
    (arrangement) =>
      arrangement.targetPath === fileName && arrangement.type === "file",
  );
  const groupName = arrangement?.groupName;
  const isInView = useInView(container, { once: true });
  const {
    data: response,
    isLoading,
    isSuccess,
  } = useGetContentQuery(
    {
      owner: config.userName,
      repo: config.repo,
      path: fileName,
      ref: config.branch,
      parser: true,
    },
    {
      skip: !isInView,
    },
  );

  const { data: commit } = useGetCommitQuery(
    {
      owner: config.userName,
      repo: config.repo,
      path: fileName,
      sha: config.branch,
    },
    {
      refetchOnMountOrArgChange: true,
    },
  );

  if (!isSuccess || isLoading) {
    return (
      <div
        ref={container}
        className="grid grid-cols-12 border-border/20 overflow-hidden items-center [&>*]:py-2 px-6 2xl:px-8"
        key={file.name}
      >
        <div className="col-span-4 h-full !py-0 flex items-center text-secondary-foreground text-ellipsis overflow-hidden">
          <Skeleton className="w-4/5 h-6" />
        </div>
        <div className="col-span-2 font-medium text-foreground text-sm">
          <p className="line-clamp-1">{slugify(path.parse(file.name).name)}</p>
        </div>
        <div className="col-span-4 text-center flex items-center justify-center">
          <Skeleton className="w-4/5 h-6" />
        </div>
        <div className="col-span-1 text-left">
          <Skeleton className="w-4/5 h-6" />
        </div>
        <div className="col-span-1 text-right">
          <Button
            className="text-muted-foreground"
            variant={"ghost"}
            size={"icon"}
          >
            <EllipsisVertical className="mx-auto text-secondary-foreground" />
          </Button>
        </div>
      </div>
    );
  }

  const { data } = response;
  const title = data?.title?.trim() || groupName || fileName;
  const { name, ext } = path.parse(fileName);
  const date = commit?.[0]?.commit.author?.date;

  return (
    <div
      className="grid grid-cols-12 border-border/20 overflow-hidden items-center [&>*]:py-2 px-6 2xl:px-8"
      key={file.name}
    >
      <div className="col-span-4 h-full !py-0 flex items-center text-secondary-foreground text-ellipsis overflow-hidden">
        <Link
          className="line-clamp-1 text-sm pr-1 text-foreground hover:underline underline-offset-4 font-semibold"
          href={`${pathname}/${name}${ext}`}
        >
          {title}
        </Link>
      </div>
      <div className="col-span-2 font-medium text-foreground text-sm">
        <p className="line-clamp-1">{slugify(path.parse(file.name).name)}</p>
      </div>
      <div className="col-span-4 text-center flex items-center justify-center">
        <p className="text-center font-medium text-foreground text-sm">
          {date ? dateFormat(date) : "N/A"}
        </p>
      </div>
      <div className="col-span-1 text-left">
        {data?.draft ? (
          <Badge variant={"destructive"} size={"lg"}>
            Draft
          </Badge>
        ) : (
          <Badge variant={"success"} size={"lg"}>
            Published
          </Badge>
        )}
      </div>
      <div className="col-span-1 text-right">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              className="text-muted-foreground"
              variant={"ghost"}
              size={"icon"}
            >
              <EllipsisVertical className="mx-auto text-secondary-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            collisionPadding={8}
            align="end"
            side="bottom"
            sideOffset={-30}
            alignOffset={35}
            className="p-1.5 max-w-[156px]"
          >
            <ul>
              <li>
                <FileOperation
                  operation="duplicate"
                  title={`Are you sure you want to duplicate the ${file.name}`}
                  path={file.path.replace("files/", "")}
                >
                  <CopyIcon className="mr-2 h-4 w-4" />
                  <span className="text-primary">Duplicate</span>
                </FileOperation>
              </li>

              <li>
                <FileOperation
                  operation="rename"
                  title={`Are you sure you want to rename the ${file.name}`}
                  path={file.path.replace("files/", "")}
                >
                  <Edit2Icon className="mr-2 h-4 w-4" />
                  <span className="text-primary">Rename</span>
                </FileOperation>
              </li>
              <li>
                <FileOperation
                  operation="delete"
                  title={"Are you sure you want to delete the " + file.name}
                  path={file.path.replace("files/", "")}
                >
                  <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                  <span className="text-destructive">Delete</span>
                </FileOperation>
              </li>
            </ul>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
