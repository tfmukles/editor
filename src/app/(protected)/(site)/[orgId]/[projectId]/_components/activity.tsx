"use client";

import { Button } from "@/components/ui/button";
import { selectConfig } from "@/redux/features/config/slice";
import { useGetCommitQuery } from "@/redux/features/git/commitApi";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import Commit from "./commit";

export default function Activity() {
  const { branch, userName: owner, repo } = useSelector(selectConfig);
  const ref = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);

  const { data: commits, isLoading } = useGetCommitQuery(
    { owner, repo, page, per_page: 4, sha: branch },
    {
      skip: !owner || !repo || !branch,
      refetchOnMountOrArgChange: true,
    },
  );

  const lastCommit = useRef<number | null>(null);
  const lastCommitNumber = lastCommit.current;

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
    if (commits) {
      lastCommit.current = commits.length;
    }
  };

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, []);

  const commitLoading = (lastCommitNumber || 0) >= (commits?.length || 0);

  useEffect(() => {
    if (!commitLoading && lastCommit.current !== null) {
      ref.current?.scrollTo({
        top: ref.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [commitLoading]);

  return (
    <>
      <div
        ref={ref}
        className="h-full overflow-x-hidden overflow-y-auto max-h-[338px]"
      >
        {commits?.map((commit, index) => (
          <Commit key={index} commit={commit} />
        ))}
      </div>
      <div className="px-8 mt-4">
        <Button
          disabled={isLoading}
          className="w-full border border-border"
          onClick={handleLoadMore}
        >
          <span className="ml-1">Load More</span>
          {(commitLoading || isLoading) && (
            <Loader2 className="animate-spin size-5 ml-1.5" />
          )}
        </Button>
      </div>
    </>
  );
}
