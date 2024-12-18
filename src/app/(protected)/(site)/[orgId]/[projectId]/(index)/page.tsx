"use client";;
import { use } from "react";

import ConfigForm from "@/components/config-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { Separator } from "@/components/ui/separator";
import { selectConfig } from "@/redux/features/config/slice";
import { useGetTreesQuery } from "@/redux/features/git/contentApi";
import { ArrowRight, GitBranch, Layout, Settings } from "lucide-react";
import { useSession } from "next-auth/react";
import { useSelector } from "react-redux";
import Activity from "../_components/activity";
import Loading from "./loading";

export default function Project(
  props: {
    params: Promise<{ orgId: string; projectId: string }>;
  }
) {
  const params = use(props.params);
  const { data: session } = useSession();
  const { user } = session || {};
  const config = useSelector(selectConfig);
  const { userName: owner, repo, branch } = config;

  const { data, isLoading } = useGetTreesQuery({
    owner: config.userName,
    repo: config.repo,
    tree_sha: config.branch,
    recursive: "1",
  });

  if (isLoading) {
    return <Loading />;
  }

  const { files: trees = [] } = data || {};
  const actions = [
    {
      label: "Arrange Site",
      href: `/${params.orgId}/${params.projectId}/arrangement`,
      icon: Layout,
      description: "Organize and arrange your site structure",
    },
    {
      label: "Settings",
      href: `/${params.orgId}/${params.projectId}/setting`,
      icon: Settings,
      description: "Configure project preferences",
    },
  ];

  return (
    <>
      <div className="grid xl:grid-cols-2 gap-8">
        <div className="space-y-8">
          <Card>
            <CardContent className="px-8 py-10">
              <div className="mb-7">
                <h1 className="mb-3 font-semibold">
                  Welcome, {user?.userName}
                </h1>
                <p>
                  Ready to start a new project? Or dive back to on of your past
                  projects
                </p>
              </div>

              <div className="space-y-4 inline-block">
                <h5 className="font-semibold">Git Repository</h5>
                <Card className="w-auto">
                  <CardContent className="p-8 space-y-3">
                    <div className="flex justify-between space-x-48">
                      <h3 className="font-semibold">
                        <a
                          href={`https://github.com/${owner}/${repo}`}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {repo}
                        </a>
                      </h3>
                      <a
                        rel="noreferrer"
                        target="_blank"
                        href={`https://github.com/${owner}/${repo}`}
                      >
                        <Icons.gitHub />
                      </a>
                    </div>
                    <p className="text-sm">
                      Build sitemap then export to our CMS
                    </p>
                  </CardContent>
                </Card>
                <Card className="w-auto">
                  <CardContent className="p-8 space-y-3">
                    <div className="flex justify-between">
                      <a
                        href={`https://github.com/${owner}/${repo}/tree/${branch}`}
                        rel="noreferrer"
                        target="_blank"
                        className="text-h3 font-semibold"
                      >
                        {branch}
                      </a>

                      <a
                        href={`https://github.com/${owner}/${repo}/tree/${branch}`}
                        rel="noreferrer"
                        target="_blank"
                        className="text-h3 font-semibold"
                      >
                        <GitBranch className="size-4 stroke-1" />
                      </a>
                    </div>
                    <p className="text-sm">
                      Build sitemap then export to our CMS
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="px-8 py-10">
              {actions.map((action, index) => (
                <div key={action.href}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {action.icon && (
                        <action.icon className="h-5 w-5 text-muted-foreground" />
                      )}
                      <h3 className="font-medium">{action.label}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                    <Button asChild variant="outline" className="w-full">
                      <a
                        href={action.href}
                        className="inline-flex items-center justify-center gap-2"
                      >
                        {action.label}
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-8">
          <Card>
            <CardContent className="px-8 py-10">
              <h3 className="font-medium mb-5">Content Configuration</h3>
              <ConfigForm
                key={config.content?.root}
                trees={trees.filter((tree) => {
                  if (tree.path?.startsWith(".")) {
                    return false;
                  } else if (tree.type === "tree") {
                    return true;
                  } else if (
                    tree.path?.endsWith(".md") ||
                    tree.path?.endsWith(".mdx") ||
                    tree.path?.endsWith(".yaml") ||
                    tree.path?.endsWith(".json")
                  ) {
                    return true;
                  } else {
                    return false;
                  }
                })}
                config={config}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row space-y-0 justify-between pb-6 border-b border-b-border">
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-6">
              <Activity />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
