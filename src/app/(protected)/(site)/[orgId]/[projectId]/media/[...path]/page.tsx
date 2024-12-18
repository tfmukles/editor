"use client";;
import { use } from "react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { findFileByPath } from "@/lib/utils/common";
import { selectConfig } from "@/redux/features/config/slice";
import { useGetTreesQuery } from "@/redux/features/git/contentApi";
import { IFiles } from "@/types";
import { useSelector } from "react-redux";
import MediaManager from "./_components/media-manager";
import Loading from "./loading";

const LIMIT = 20;

export default function MainPage(
  props: {
    params: Promise<{ path: string[]; orgId: string; projectId: string }>;
    searchParams: Promise<{ page: number; q: string }>;
  }
) {
  const searchParams = use(props.searchParams);
  const params = use(props.params);
  const config = useSelector(selectConfig);
  const { data, isLoading: isTreesLoading } = useGetTreesQuery({
    owner: config.userName,
    repo: config.repo,
    tree_sha: config.branch,
    recursive: "1",
  });

  const files = data?.trees || [];

  if (isTreesLoading) {
    return <Loading />;
  }

  const mediaDir = "media" + "/" + params.path.join("/");
  const pathname = `/${params.orgId}/${params.projectId}/media/${params.path.join("/")}`;

  const childrenFile = findFileByPath(files![1]?.children! || [], mediaDir);

  let filterResult: IFiles[] | undefined = childrenFile?.children;
  if (searchParams.q) {
    filterResult = filterResult?.filter((item) =>
      item.name.toLowerCase().includes(searchParams.q.toLowerCase()),
    );
  }
  const totalPage = Math.ceil((filterResult?.length || 0) / LIMIT);
  const currentPage = +searchParams.page || 1;
  const startIndex = (currentPage - 1) * LIMIT;
  const endIndex = startIndex + LIMIT;
  const lowest = Math.max(currentPage - 1, 1);
  const highest = Math.min(currentPage + 1, totalPage);

  return (
    <>
      <MediaManager trees={filterResult?.slice(startIndex, endIndex) ?? []} />

      {totalPage > 1 && (
        <Pagination className="py-3">
          <PaginationContent>
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious
                  href={`${pathname}?page=${currentPage - 1}`}
                />
              </PaginationItem>
            )}

            {currentPage > 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {[...Array(totalPage)].map((_, i) => {
              return (
                <PaginationItem
                  key={i}
                  className={
                    lowest <= i + 1 && i + 1 <= highest ? "" : "hidden"
                  }
                >
                  <PaginationLink
                    isActive={i + 1 === currentPage}
                    href={`${pathname}/?page=${i + 1}`}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            {highest < totalPage && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            {currentPage < totalPage && (
              <PaginationItem>
                <PaginationNext href={`${pathname}/?page=${currentPage + 1}`} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </>
  );
}
