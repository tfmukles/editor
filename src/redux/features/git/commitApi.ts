import { toast } from "@/hooks/use-toast";
import { GITHUB_APP_NAME } from "@/lib/constant";
import { checkMedia } from "@/lib/utils/checkMediaFile";
import { parseContentJson } from "@/lib/utils/contentFormatter";
import { fmDetector } from "@/lib/utils/fmDetector";
import { pathToDir } from "@/lib/utils/pathToDir";
import { RootState } from "@/redux/store";
import { ITree } from "@/types";
import { getSession } from "next-auth/react";
import path from "path";
import { updateConfig } from "../config/slice";
import { contentApi } from "./contentApi";
import { githubApi } from "./gitApi";
import { GitHubOption, GitHubPromise } from "./type";

export const commitApi = githubApi.injectEndpoints({
  endpoints: (build) => ({
    getCommit: build.query<
      GitHubPromise<"GET /repos/{owner}/{repo}/commits">,
      GitHubOption<"GET /repos/{owner}/{repo}/commits">
    >({
      query: (arg) => ({
        endpoint: "GET /repos/{owner}/{repo}/commits",
        options: arg,
      }),
      providesTags(result, error, arg, meta) {
        return arg.path
          ? [{ type: "commit", id: `${arg.path}` }]
          : [{ type: "commit", id: undefined }];
      },
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}("${queryArgs.path}")`;
      },
      merge(currentCache, newItems) {
        return [...currentCache, ...newItems];
      },
      forceRefetch({ currentArg, previousArg }) {
        return (
          currentArg?.path !== previousArg?.path ||
          currentArg?.sha !== previousArg?.sha ||
          currentArg?.page !== previousArg?.page
        );
      },
    }),

    updateFiles: build.mutation<
      GitHubPromise<"POST /repos/{owner}/{repo}/git/commits">,
      GitHubOption<"POST /repos/{owner}/{repo}/git/commits"> & {
        files: Array<{ path: string; content: string }>;
        message: string;
        description?: string;
        createFolder?: boolean;
      }
    >({
      // @ts-ignore
      async queryFn(
        { owner, repo, tree: branch, files, message, description },
        api,
        extraOptions,
        fetchWithBQ,
      ) {
        try {
          const token = await getSession();
          const user = token?.user;
          const loginUserEmail = user?.email;
          // Fetch the authenticated user's details
          const userResult = await fetchWithBQ({
            endpoint: "GET /user",
            options: {},
          });

          if (!userResult.data) {
            throw new Error("Failed to fetch user details.");
          }

          const { login, email } = userResult.data as {
            login: string;
            email: string;
          };

          // 1. Fetch the current branch reference
          const branchRefResult = await fetchWithBQ({
            endpoint: "GET /repos/{owner}/{repo}/git/ref/{ref}",
            options: {
              ref: "heads/" + branch,
              owner,
              repo,
            },
          });

          if (!branchRefResult.data) {
            throw new Error("Failed to fetch branch reference.");
          }

          const branchRef = branchRefResult.data as { object: { sha: string } };

          const baseTreeSha = branchRef.object.sha;

          // 2. Create blobs for each file
          const blobs = await Promise.all(
            files.map(async (file) => {
              const blobResult = await fetchWithBQ({
                endpoint: "POST /repos/{owner}/{repo}/git/blobs",
                options: {
                  owner,
                  repo,
                  content: file.content,
                  ...(checkMedia(file.path) &&
                    file.content && { encoding: "base64" }),
                },
              });

              if (!blobResult.data) {
                throw new Error(`Failed to create blob for file: ${file.path}`);
              }

              return blobResult.data as { sha: string };
            }),
          );

          // 3. Create tree object using blobs
          const treeData = blobs.map((blob, index) => ({
            path: files[index].path,
            type: "blob",
            mode: "100644",
            sha:
              files[index].content || files[index].path.endsWith(".gitkeep")
                ? blob.sha
                : null,
          }));

          // 4. Create the tree using the created blobs
          const treeResult = await fetchWithBQ({
            endpoint: "POST /repos/{owner}/{repo}/git/trees",
            options: { tree: treeData, base_tree: branch, owner, repo },
          });

          if (!treeResult.data) {
            throw new Error("Failed to create tree object.");
          }

          const tree = treeResult.data as { sha: string };

          const auth_details = {
            email: `${GITHUB_APP_NAME}[bot]@users.noreply.github.com`,
            name: `${GITHUB_APP_NAME}[bot]`,
          };

          const userEmail = email || loginUserEmail;
          const coAuthor = `Co-authored-by: ${login} <${userEmail}>`;
          const commitMessage = `${message} by Sitepins${description ? `\n\n${description}` : ""}\n\n${coAuthor} `;

          // 5. Create commit with the tree object
          const commitResult = await fetchWithBQ({
            endpoint: "POST /repos/{owner}/{repo}/git/commits",
            options: {
              owner,
              repo,
              message: commitMessage,
              author: auth_details,
              committer: auth_details,
              tree: tree.sha,
              parents: [baseTreeSha],
            },
          });

          if (!commitResult.data) {
            throw new Error("Failed to create commit.");
          }
          const commit = commitResult.data as { sha: string };
          // 6. Push the commit reference to the repository
          const pushResult = await fetchWithBQ({
            endpoint: "PATCH /repos/{owner}/{repo}/git/refs/{ref}",
            options: {
              sha: commit.sha,
              force: true,
              ref: "heads/" + branch,
              owner,
              repo,
            },
          });

          if (!pushResult.data) {
            throw new Error("Failed to update branch reference.");
          }

          return { data: commit };
        } catch (error: any) {
          console.error("Error during Git operations:", error.message);
          throw error; // Re-throw to propagate the error
        }
      },
      async onQueryStarted(arg, { queryFulfilled, dispatch, getState }) {
        const { config: storeConfig } = getState() as RootState;

        try {
          await queryFulfilled;
          dispatch(
            commitApi.util.invalidateTags([
              {
                type: "commit",
                id: undefined,
              },
            ]),
          );
          arg.files.map((file) => {
            if (file.path === ".sitepins/config.json") {
              const config = JSON.parse(file.content);
              dispatch(updateConfig(config));
              dispatch(
                contentApi.util.updateQueryData(
                  "getTrees",
                  {
                    owner: storeConfig.userName,
                    repo: storeConfig.repo,
                    tree_sha: storeConfig.branch,
                    recursive: "1",
                  },
                  (draft) => {
                    draft.trees = pathToDir(draft.files, {
                      ...storeConfig,
                      ...config,
                    });
                    return draft;
                  },
                ),
              );
            } else if (file.path.startsWith(storeConfig.media.public)) {
              dispatch(
                contentApi.util.updateQueryData(
                  "getTrees",
                  {
                    owner: storeConfig.userName,
                    repo: storeConfig.repo,
                    tree_sha: storeConfig.branch,
                    recursive: "1",
                  },
                  (draft) => {
                    let pathTrees = draft.files.filter(
                      (tree) => tree.path !== file.path,
                    );

                    if (file.content) {
                      const extension = path.extname(file.path);
                      pathTrees.push({
                        path: file.path,
                        type: extension ? "tree" : "blob",
                        sha: null,
                        mode: "100644",
                      });
                    }

                    return {
                      files: pathTrees,
                      trees: pathToDir(pathTrees, storeConfig),
                    };
                  },
                ),
              );

              if (file.path.startsWith(storeConfig.content.root)) {
                const fm = fmDetector(file.content, path.parse(file.path).ext);
                const parsedContent = parseContentJson(file.content, fm);
                dispatch(
                  contentApi.util.updateQueryData(
                    "getContent",
                    {
                      owner: arg.owner,
                      repo: arg.repo,
                      ref: arg.tree,
                      path: file.path,
                      parser: true,
                    },
                    (draft) => {
                      return {
                        ...draft,
                        ...parsedContent,
                        fmType: fm,
                      };
                    },
                  ),
                );
              }
            }
          });
        } catch ({ error }: any) {
          toast({
            title: error.message,
            variant: "destructive",
          });
        }
      },
    }),

    renameFolder: build.mutation<
      GitHubPromise<"PATCH /repos/{owner}/{repo}/git/refs/{ref}">,
      Omit<GitHubOption<"POST /repos/{owner}/{repo}/git/commits">, "files"> & {
        message: string;
        oldFolder: string;
        newFolder: string;
        description?: string;
      }
    >({
      // @ts-ignore
      async queryFn(
        {
          owner,
          repo,
          tree: branch,
          message,
          newFolder,
          oldFolder,
          description,
        },
        api,
        extraOptions,
        fetchWithBQ,
      ) {
        try {
          const { dispatch, getState } = api;
          const { config } = getState() as RootState;
          const token = await getSession();
          const user = token?.user;
          const loginUserEmail = user?.email;

          // Fetch the authenticated user's details
          const userResult = await fetchWithBQ({
            endpoint: "GET /user",
            options: {},
          });

          if (!userResult.data) {
            throw new Error("Failed to fetch user details.");
          }

          const { login, email } = userResult.data as {
            login: string;
            email: string;
          };

          const auth_details = {
            email: `${GITHUB_APP_NAME}[bot]@users.noreply.github.com`,
            name: `${GITHUB_APP_NAME}[bot]`,
          };

          const userEmail = email || loginUserEmail;
          const coAuthor = `Co-authored-by: ${login} <${userEmail}>`;
          const commitMessage = `${message} by Sitepins${description ? `\n\n${description}` : ""}\n\n${coAuthor} `;

          // Step 1: Get the current branch details
          const branchResponse = await fetchWithBQ({
            endpoint: "GET /repos/{owner}/{repo}/branches/{branch}",
            options: { owner, repo, branch },
          });

          if (!branchResponse.data) {
            throw new Error("Failed to fetch branch details.");
          }

          const branchData = branchResponse.data as {
            commit: {
              sha: string;
            };
          };
          const branchSha = branchData.commit.sha;

          // Step 2: Get the current tree (list of files)
          const treeResponse = await fetchWithBQ({
            endpoint: "GET /repos/{owner}/{repo}/git/trees/{tree_sha}",
            options: { owner, repo, tree_sha: branchSha, recursive: "1" },
          });

          if (!treeResponse.data) {
            throw new Error("Failed to fetch tree details.");
          }

          const treeData = treeResponse.data as {
            sha: string;
            tree: ITree[];
          };

          const fileToRename = treeData.tree.filter((file) =>
            file.path?.startsWith(oldFolder),
          );

          if (!fileToRename.length) {
            throw new Error("File to rename not found.");
          }

          // Step 3: Create a new tree with the renamed file
          const newTreeResponse = await fetchWithBQ({
            endpoint: "POST /repos/{owner}/{repo}/git/trees",
            options: {
              owner,
              repo,
              base_tree: branchSha,
              tree: fileToRename
                .map((file) => [
                  {
                    ...file,
                    path: file.path?.replace(oldFolder, newFolder),
                  },
                  {
                    ...file,
                    sha: null,
                  },
                ])
                .flat(),
            },
          });

          if (!newTreeResponse.data) {
            throw new Error("Failed to create a new tree.");
          }
          const newTreeData = newTreeResponse.data as {
            sha: string;
          };

          const newTreeSha = newTreeData.sha;
          // Step 4: Create a new commit with the renamed file
          const commitResponse = await fetchWithBQ({
            endpoint: "POST /repos/{owner}/{repo}/git/commits",
            options: {
              owner,
              repo,
              message: commitMessage,
              author: auth_details,
              committer: auth_details,
              tree: newTreeSha,
              parents: [branchSha],
            },
          });

          if (!commitResponse.data) {
            throw new Error("Failed to create a new commit.");
          }

          const commitData = commitResponse.data as {
            sha: string;
          };
          const commitSha = commitData.sha;
          // Step 5: Update the branch to point to the new commit

          dispatch(
            contentApi.util.updateQueryData(
              "getTrees",
              {
                owner,
                repo,
                tree_sha: branch,
                recursive: "1",
              },
              (draft) => {
                const files = treeData.tree.filter(
                  (file) => !file.path?.startsWith(oldFolder),
                );
                draft.files = files;
                draft.trees = pathToDir(files, config);
                return draft;
              },
            ),
          );

          return await fetchWithBQ({
            endpoint: "PATCH /repos/{owner}/{repo}/git/refs/{ref}",
            options: {
              owner,
              repo,
              ref: `heads/${branch}`,
              sha: commitSha,
            },
          });
        } catch (error) {}
      },
    }),
  }),
});

export const { useGetCommitQuery, useUpdateFilesMutation } = commitApi;
