"use client";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody } from "@/components/ui/table";
import {
  selectMediaInfo,
  setMedia,
} from "@/redux/features/media-manager/slice";

import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppDispatch } from "@/redux/store";
import { IFiles } from "@/types";
import { FolderClosed, FolderIcon } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ForwardedRef, forwardRef, useEffect } from "react";
import { useSelector } from "react-redux";
import ImageSidebar from "./image-sidebar";

import { cn } from "@udecode/cn";
import Image from "./Image";
import FileUploader from "./file-uploader";
import ListView from "./list-view";

const MediaManager = forwardRef<
  HTMLDivElement,
  {
    trees: IFiles[];
  }
>(({ trees }, ref: ForwardedRef<HTMLDivElement>) => {
  const params = useParams();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { media, view } = useSelector(selectMediaInfo);
  useEffect(() => {
    if (trees.length !== media.length) {
      dispatch(setMedia(trees));
    }
  }, []);

  useEffect(() => {
    dispatch(setMedia(trees));
  }, [searchParams]);

  if (view === "list" && media.length > 0) {
    return (
      <div className="mt-7">
        <div className="border border-border rounded-lg mb-3">
          <Table>
            <TableHeader>
              <TableRow className="!border-b-0 hover:bg-transparent">
                <TableHead className="w-[50%]">Image</TableHead>
                <TableHead className="w-[25%] text-center">
                  Last Modified
                </TableHead>
                <TableHead className="text-right w-[25%]">Size</TableHead>
              </TableRow>
            </TableHeader>
          </Table>
        </div>

        <div className="border border-border rounded-lg">
          <Table>
            <TableBody>
              {media.map((file, index) => {
                return <ListView key={file.path} file={file} />;
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mt-7 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6  gap-4 relative",
        media.length <= 0 && "flex-1",
      )}
    >
      {media.length <= 0 ? (
        <div className="col-span-6 h-full text-center space-y-4 flex flex-col justify-center">
          <img
            className="mx-auto"
            src={"/images/empty-folder.svg"}
            width={300}
            height={300}
            alt="empty-folder"
          />
          <h2 className="text-center text-xl">No File Found</h2>
          <div>
            <FileUploader className="relative" type="button">
              <FolderIcon className="size-4 mr-1.5" />
              <span>Upload</span>
            </FileUploader>
          </div>
        </div>
      ) : (
        media.map((file, index) => {
          const { isFile, isNew, name, path: filepath } = file;
          return (
            <ImageSidebar key={file.path + "_" + index} file={file}>
              <Card className="overflow-hidden relative h-auto shadow-none">
                {!isFile && (
                  <Link
                    className="absolute inset-0 z-10"
                    href={`/${params.orgId}/${params.projectId}/${filepath}`}
                  />
                )}
                <CardContent className="p-0 relative">
                  <AspectRatio
                    ratio={4 / 3}
                    className={cn("bg-light p-3", isFile && "bg-stripes-gray")}
                  >
                    {isFile ? (
                      <Image src={filepath.replace("/media", "")} />
                    ) : (
                      <div className="flex items-center justify-center  h-full">
                        <FolderClosed
                          stroke="currentColor"
                          className="size-14 mx-auto"
                        />
                      </div>
                    )}
                  </AspectRatio>

                  {isNew && (
                    <Badge
                      variant={"destructive"}
                      className="absolute top-2 right-2"
                    >
                      New
                    </Badge>
                  )}
                </CardContent>
                <CardFooter className="py-2 pt-2 px-4 pb-3.5">
                  <p className="text-secondary-foreground line-clamp-1 text-sm">
                    {name}
                  </p>
                </CardFooter>
              </Card>
            </ImageSidebar>
          );
        })
      )}
    </div>
  );
});

export default MediaManager;
