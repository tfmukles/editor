"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { selectConfig } from "@/redux/features/config/slice";
import { useGetTreesQuery } from "@/redux/features/git/contentApi";
import { useSelector } from "react-redux";
import AddItem from "./_components/add-item";

export default function Setting() {
  const config = useSelector(selectConfig);
  const { data, isLoading: isTreesLoading } = useGetTreesQuery({
    owner: config.userName,
    repo: config.repo,
    tree_sha: config.branch,
    recursive: "1",
  });

  const trees = data?.files || [];

  if (isTreesLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      <h2 className="text-lg font-semibold leading-none tracking-tight mb-3">
        Rearrange Files
      </h2>
      <AddItem trees={trees!} />
    </div>
  );
}
