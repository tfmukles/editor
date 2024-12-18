import { getTrees } from "@/actions/project-config";
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
import { IFiles } from "@/types";
import MediaManager from "./media-manager";

const LIMIT = 20;

export default async function MainPage({
  params,
  searchParams,
}: {
  params: { path: string[]; orgId: string; projectId: string };
  searchParams: { page: number; q: string };
}) {
  const files = await getTrees(params);
  const mediaDir = "media" + "/" + params.path.join("/");

  const childrenFile = await findFileByPath(
    files[1]?.children! || [],
    mediaDir,
  );

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
                    href={`/?page=${i + 1}`}
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
                <PaginationNext href={`/?page=${currentPage + 1}`} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </>
  );
}
