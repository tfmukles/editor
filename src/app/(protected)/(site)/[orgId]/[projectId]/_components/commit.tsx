import Avatar from "@/components/avatar";
import { Badge } from "@/components/ui/badge";
import { selectConfig } from "@/redux/features/config/slice";
import { useGetDeployStatusQuery } from "@/redux/features/git/contentApi";
import { GitHubPromise } from "@/redux/features/type";
import { useSelector } from "react-redux";

export default function Commit({
  commit,
}: {
  commit: GitHubPromise<"GET /repos/{owner}/{repo}/commits">[0];
}) {
  const { userName: owner, repo } = useSelector(selectConfig);
  const { data } = useGetDeployStatusQuery({
    owner,
    repo,
    ref: commit.sha,
  });

  const conclusion = data?.check_runs[0]?.conclusion;

  return (
    <div className="px-8 border-b border-b-border flex py-4 space-x-3 relative">
      <Avatar
        email={commit.author?.email!}
        src={commit.author?.avatar_url!}
        alt=""
        width={40}
        height={40}
        className="!w-10 !h-10 bg-secondary rounded-full"
      />
      <div>
        <p className="text-sm font-medium text-primary">
          {commit.commit?.author?.name}
        </p>
        <p className="text-sm font-medium text-popover-foreground">
          {new Date(commit.commit?.author?.date!).toDateString()}
        </p>
        <p className="text-sm text-popover-foreground line-clamp-1">
          {commit.commit.message}
        </p>
        {data?.total_count! > 0 && (
          <Badge
            variant={conclusion === "success" ? "success" : "destructive"}
            className="absolute top-2 right-2 capitalize"
          >
            {conclusion === "success" ? "Build Success" : "Build Failed"}
          </Badge>
        )}
      </div>
    </div>
  );
}
