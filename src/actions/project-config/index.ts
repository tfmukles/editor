"use server";

import { selectedRepoDetails } from "@/actions/utils";
import { convertArrangement } from "@/lib/utils/common";
import { parseContentJson } from "@/lib/utils/contentFormatter";
import { fmDetector } from "@/lib/utils/fmDetector";
import { pathToDir } from "@/lib/utils/pathToDir";
import { ITree } from "@/types";
import toml from "@iarna/toml";
import { RequestError } from "octokit";
import path from "path";
import { cache } from "react";
import { updateFiles } from "../commit";
import { gitFetch } from "../utils/gitFetch";

export const getTrees = cache(
  async ({ projectId, orgId }: { projectId: string; orgId: string }) => {
    const { branch, userName, repoName, token } = await selectedRepoDetails({
      projectId,
      orgId,
    });

    const config = await getContent({
      path: ".sitepins/config.json",
      json: true,
      projectId,
      orgId,
    });

    const { tree } = await gitFetch(
      "GET /repos/{owner}/{repo}/git/trees/{tree_sha}",
      {
        token,
        owner: userName,
        repo: repoName,
        tree_sha: branch,
        recursive: "1",
      },
    );

    return pathToDir(tree as ITree[], config);
  },
);

export const getContent = cache(
  async ({
    path: pathDir,
    json,
    parser = false,
    fallback,
    format = true,
    projectId,
    orgId,
  }: {
    path: string;
    json?: boolean;
    parser?: boolean;
    fallback?: () => any;
    format?: boolean;
    projectId: string;
    orgId: string;
  }) => {
    const { branch, userName, repoName, token } = await selectedRepoDetails({
      projectId,
      orgId,
    });

    try {
      const content = await gitFetch(
        "GET /repos/{owner}/{repo}/contents/{path}",
        {
          token,
          owner: userName,
          repo: repoName,
          path: pathDir,
          ref: branch,
          ...(format && { format: "base64" }),
          json: json || false,
        },
      );

      if (parser) {
        // @ts-ignore
        const fm = fmDetector(content, path.parse(pathDir).ext);

        const parsedContent =
          fm === "toml"
            ? {
                data: JSON.parse(JSON.stringify(toml.parse(content as any))),
                content: null,
                fmType: fm,
              }
            : parseContentJson(content as any, fm);

        return { ...parsedContent, fmType: fm };
      }

      if (pathDir === ".sitepins/config.json") {
        //  @ts-ignore
        let arrangements = content?.arrangement ?? [];
        const isArray = Array.isArray(arrangements);
        if (!isArray && arrangements) {
          const config = await selectedRepoDetails({
            projectId,
            orgId,
          });
          arrangements = convertArrangement(arrangements);
          updateFiles({
            files: [
              {
                path: ".sitepins/config.json",
                content: JSON.stringify(
                  {
                    ...content,
                    arrangement: arrangements,
                  },
                  null,
                  2,
                ),
              },
            ],
            message: `migrate config file to new format`,
            // @ts-ignore
            config,
          });
        }
        return {
          ...content,
          arrangement: arrangements,
        };
      }
      return content;
    } catch (error) {
      if (typeof fallback === "function") {
        return fallback();
      }
      if (error instanceof RequestError) {
        return { error: error.message, status: error.status };
      }
      return { error: "Something went wrong", isError: true, status: 500 };
    }
  },
);
