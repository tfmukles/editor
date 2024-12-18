"use client";

import Search from "@/components/Search";
import { Button } from "@/components/ui/button";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { selectConfig } from "@/redux/features/config/slice";
import {
  selectMediaInfo,
  setSortBy,
  setView,
} from "@/redux/features/media-manager/slice";
import { useAppDispatch } from "@/redux/store";
import { cn } from "@udecode/cn";
import { FolderIcon, RotateCw } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { data, views } from "./data";
import FileUploader from "./file-uploader";
import CreateFolder from "./new-folder";

export default function MediaHeader() {
  const ref = React.useRef<HTMLDivElement>(null);
  const { view } = useSelector(selectMediaInfo);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const params = useParams();
  const config = useSelector(selectConfig);

  const directory = useMemo(() => {
    const files = params.path as string[];
    return files.map((item) => decodeURIComponent(item));
  }, [params.path]);

  useEffect(() => {
    window.scroll({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [params]);

  return (
    <div>
      <div ref={ref} className="flex justify-between mb-8">
        <h2>
          <Link
            href={`/${params?.orgId}/${params?.projectId}/media/${config.media.root}`}
          >
            Media
          </Link>
        </h2>
        <ul className="flex space-x-2">
          <li>
            <Button variant={"outline"} onClick={router.refresh}>
              <RotateCw className="size-4 mr-1.5" />
              <span>Sync</span>
            </Button>
          </li>
          <li>
            <CreateFolder variant={"outline"} type="button" />
          </li>
          <li>
            <FileUploader className="relative" type="button">
              <FolderIcon className="size-4 mr-1.5" />
              <span>Upload</span>
            </FileUploader>
          </li>
        </ul>
      </div>
      <div className="flex justify-between space-x-2">
        <Search className="flex-1 h-10 [&_input]:h-10" />
        <Select
          onValueChange={(value) => {
            dispatch(setSortBy(value));
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {data.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="border border-border rounded-lg flex items-center p-1 h-10">
          {views.map((item) => (
            <Button
              key={item.label}
              onClick={() => dispatch(setView(item.value as any))}
              type="button"
              variant={"ghost"}
              className={cn(
                "w-10 h-8 p-0 relative",
                view === item.value && "bg-accent",
              )}
            >
              <item.icon className="size-6" />
            </Button>
          ))}
        </div>
      </div>

      <Breadcrumb className="mt-3">
        <BreadcrumbList>
          {directory.map((item, index) => {
            return (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      href={`/${params?.orgId}/${params?.projectId}/media/${directory
                        .slice(0, index + 1)
                        .join("/")}`}
                    >
                      {item}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {index !== directory.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
