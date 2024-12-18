import { parseContentJson } from "@/lib/utils/contentFormatter";
import { fmDetector } from "@/lib/utils/fmDetector";
import { decodeBase64 } from "@/lib/utils/generateSchema";
import { pathToDir } from "@/lib/utils/pathToDir";
import { store } from "@/redux/store";
import { IFiles, ITree } from "@/types";
import path from "path";
import { updateConfig } from "../config/slice";
import { commitApi } from "./commitApi";
import { githubApi } from "./gitApi";
import { GitHubOption, GitHubPromise } from "./type";

export const contentApi = githubApi.injectEndpoints({
  endpoints: (builder) => ({
    // Example: Fetch user repositories
    getUserRepos: builder.query<
      GitHubPromise<"GET /users/{username}/repos">,
      GitHubOption<"GET /users/{username}/repos">
    >({
      query: ({ username }) => ({
        endpoint: "GET /users/{username}/repos",
        options: { username },
      }),
    }),

    getTrees: builder.query<
      {
        trees: IFiles[];
        files: ITree[];
      },
      GitHubOption<"GET /repos/{owner}/{repo}/git/trees/{tree_sha}"> & {
        raw?: boolean;
      }
    >({
      query: ({ owner, repo, tree_sha, recursive }) => ({
        endpoint: "GET /repos/{owner}/{repo}/git/trees/{tree_sha}",
        options: { owner, repo, tree_sha, recursive },
      }),
      providesTags: [{ type: "Files", id: "LIST" }],
      // @ts-ignore
      async transformResponse(
        baseQueryReturnValue:
          | IFiles[]
          | GitHubPromise<"GET /repos/{owner}/{repo}/git/trees/{tree_sha}">,
      ) {
        // @ts-ignore
        const response =
          // @ts-ignore
          baseQueryReturnValue as GitHubPromise<"GET /repos/{owner}/{repo}/git/trees/{tree_sha}">;
        let { config } = store.getState();
        const dispatch = store.dispatch;

        if (
          !config.content.root &&
          response.tree.find((tree) => tree.path === ".zeonCms/config.json")
        ) {
          const data = await dispatch(
            contentApi.endpoints.getSiteConfig.initiate({
              owner: config.userName,
              repo: config.repo,
              ref: config.branch,
              path: ".zeonCms/config.json",
            }),
          ).unwrap();

          dispatch(
            updateConfig({
              ...config,
              // @ts-ignore
              ...JSON.parse(decodeBase64(data.content)),
            }),
          );

          dispatch(
            commitApi.endpoints.renameFolder.initiate({
              newFolder: ".sitepins",
              oldFolder: ".zeonCms",
              owner: config.userName,
              repo: config.repo,
              tree: config.branch,
              message: "Rename .zeonCms to .sitepins",
            }),
          );
        }

        return {
          trees: pathToDir(response.tree as any, config),
          files: response.tree,
        };
      },
    }),

    getContent: builder.query<
      Record<string, any>,
      GitHubOption<"GET /repos/{owner}/{repo}/contents/{path}">
    >({
      query: ({ owner, repo, path }) => ({
        endpoint: "GET /repos/{owner}/{repo}/contents/{path}",
        options: { owner, repo, path },
      }),
      transformResponse(
        baseQueryReturnValue: Record<string, any>,
        meta,
        arg: GitHubOption<"GET /repos/{owner}/{repo}/contents/{path}">,
      ) {
        if (Array.isArray(baseQueryReturnValue)) {
          return baseQueryReturnValue;
        } else if (
          typeof baseQueryReturnValue === "object" &&
          baseQueryReturnValue.type === "file" &&
          "content" in baseQueryReturnValue &&
          baseQueryReturnValue.content
        ) {
          const { parser } = arg;
          const decodedContent = Buffer.from(
            //@ts-ignore
            baseQueryReturnValue.content,
            "base64",
          ).toString("utf-8");

          if (parser) {
            const fm = fmDetector(decodedContent, path.parse(arg.path).ext);
            const parsedContent = parseContentJson(decodedContent, fm);

            return { ...parsedContent, fmType: fm };
          }
        }

        const decodedContent = Buffer.from(
          //@ts-ignore
          baseQueryReturnValue.content,
          "base64",
        ).toString("utf-8");

        return { data: decodedContent };
      },
    }),

    getSiteConfig: builder.query<
      GitHubPromise<"GET /repos/{owner}/{repo}/contents/{path}">,
      GitHubOption<"GET /repos/{owner}/{repo}/contents/{path}">
    >({
      query: ({ owner, repo, path, ref }) => ({
        endpoint: "GET /repos/{owner}/{repo}/contents/{path}",
        options: { owner, repo, path, ref },
      }),

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (
            !Array.isArray(data) &&
            typeof data === "object" &&
            data.type === "file" &&
            "content" in data &&
            data.content
          ) {
            const decodedContent = Buffer.from(data.content, "base64").toString(
              "utf-8",
            );
            const content = JSON.parse(decodedContent);
            dispatch(updateConfig(content));
          }
        } catch (error) {
          dispatch(
            updateConfig({
              arrangement: [],
              content: {
                root: "",
              },
              media: {
                public: "",
                root: "",
              },
            }),
          );
        }
      },
    }),

    getImage: builder.query<
      { download_url: string; size: number },
      GitHubOption<"GET /repos/{owner}/{repo}/contents/{path}">
    >({
      query: (arg) => {
        return {
          endpoint: "GET /repos/{owner}/{repo}/contents/{path}",
          options: arg,
        };
      },
    }),

    getDeployStatus: builder.query<
      GitHubPromise<"GET /repos/{owner}/{repo}/commits/{ref}/check-runs">,
      GitHubOption<"GET /repos/{owner}/{repo}/commits/{ref}/check-runs">
    >({
      query: (arg) => ({
        endpoint: "GET /repos/{owner}/{repo}/commits/{ref}/check-runs",
        options: arg,
      }),
    }),
  }),
});

export const {
  useGetUserReposQuery,
  useGetTreesQuery,
  useGetSiteConfigQuery,
  useGetContentQuery,
  useGetImageQuery,
  useGetDeployStatusQuery,
} = contentApi;
