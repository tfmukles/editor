"use client";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { selectConfig } from "@/redux/features/config/slice";

import { useGetCommitQuery } from "@/redux/features/git/commitApi";
import { useGetContentQuery } from "@/redux/features/git/contentApi";
import { selectMediaInfo } from "@/redux/features/media-manager/slice";
import { IFiles } from "@/types";
import { FolderClosedIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import Image from "./Image";
import ImageSidebar from "./image-sidebar";

export default function ListView({ file }: { file: IFiles }) {
  const { branch, userName: owner, repo } = useSelector(selectConfig);
  const { view } = useSelector(selectMediaInfo);
  const { isFile, path: filepath, isNew } = file;

  const { data } = useGetContentQuery(
    {
      owner,
      repo,
      path: `${filepath.replace("media/", "")}`,
      ref: branch,
    },
    {
      skip: view !== "list",
    },
  );

  const { data: commit } = useGetCommitQuery(
    {
      owner,
      repo,
      path: filepath.replace("media/", ""),
      sha: branch,
    },
    {
      skip: view !== "list",
    },
  );

  const date = new Date(commit?.[0]?.commit.author?.date!).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );

  const params = useParams();

  return (
    <TableRow className="hover:bg-transparent">
      <TableCell className="w-[50%]">
        <div className="relative h-12">
          <ImageSidebar
            file={file}
            asChild
            className="w-full h-full space-x-3 cursor-pointer"
          >
            {isFile ? (
              <div className="flex items-center">
                <div className="max-w-[73px] flex-1">
                  <AspectRatio ratio={16 / 9} className="max-w-[73px] relative">
                    <Image
                      src={filepath.replace("/media", "")}
                      className="object-cover rounded"
                    />
                    {isNew && (
                      <Badge
                        variant={"destructive"}
                        className="absolute top-[15px] right-[12px]"
                      >
                        New
                      </Badge>
                    )}
                  </AspectRatio>
                </div>
                <p className="line-clamp-1 flex-1 max-w-[500px]">{file.name}</p>
              </div>
            ) : (
              <div className="relative inline">
                <Button
                  variant={"secondary"}
                  className="w-auto !space-x-1"
                  asChild
                >
                  <Link
                    href={`/${params.orgId}/${params.projectId}/${filepath}`}
                    className="relative"
                  >
                    <FolderClosedIcon
                      stroke="currentColor"
                      className="size-4"
                    />
                    <span className="text-primary text-sm font-medium relative">
                      {file.name}
                    </span>

                    {isNew && (
                      <Badge
                        variant={"destructive"}
                        className="absolute top-0 -right-14"
                      >
                        New
                      </Badge>
                    )}
                  </Link>
                </Button>
              </div>
            )}
          </ImageSidebar>
        </div>
      </TableCell>
      <TableCell className="w-[25%] text-center">{date}</TableCell>
      <TableCell className="w-[25%] text-right">
        {isFile && data?.size && `${Math.ceil(data?.size / 1024)} kb`}
      </TableCell>
    </TableRow>
  );
}
