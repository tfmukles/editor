"use server";

import { auth } from "@/auth";
import { GITHUB_APP_NAME } from "@/lib/constant";
import { checkMedia } from "@/lib/utils/checkMediaFile";
import { IConfig, ITree } from "@/types";
import { revalidateTag } from "next/cache";
import { gitFetch } from "../utils/gitFetch";

export const updateFiles = async ({
  files,
  createFolder,
  message,
  description,
  shouldRevalidate = true,
  config,
}: {
  files: Array<{ path: string; content: string }>;
  createFolder?: boolean;
  message?: string;
  description?: string;
  shouldRevalidate?: boolean;
  config: IConfig;
}) => {
  try {
    const { user } = (await auth()) || {};
    const loginUserEmail = user?.email;
    const { branch, userName: owner, token, repo, projectId } = config;

    const { login, email } = await gitFetch("GET /user", {
      token,
    });

    const {
      object: { sha: parents },
    } = await gitFetch("GET /repos/{owner}/{repo}/git/ref/{ref}", {
      owner,
      repo,
      token,
      ref: "heads/" + branch,
    });

    // creating blob of content
    const blobs = await Promise.all(
      files.map(async (file) => {
        return await createBlob(file, owner, repo, token);
      }),
    );

    const trees = blobs.map((blob, index) => ({
      path: files[index].path,
      type: "blob",
      mode: "100644",
      sha: files[index].content || createFolder ? blob.sha : null,
    })) as ITree[];

    // creating trees
    const treesData = await createTree(owner, repo, branch, token, trees);

    // commit changes
    const postCommit = await createCommit(
      owner,
      repo,
      parents,
      treesData.sha,
      token,
      {
        email: email || loginUserEmail,
        name: login,
      },
      message,
      description,
    );

    // create new refs for push
    const refs = await pushChanges(owner, repo, branch, token, postCommit.sha);
    if (shouldRevalidate) {
      files.forEach((file) => {
        revalidateTag(`content-${file.path}-${repo}-${branch}-${projectId}`);
        revalidateTag(`commit-${file.path}-${owner}-${repo}-${projectId}`);
      });
    }
    return { trees, refs };
  } catch (error) {
    throw error;
  }
};

export const deleteFiles = async ({
  files,
  config,
}: {
  files: Array<{ path: string; content: string }>;
  config: IConfig;
}) => {
  try {
    const { user } = (await auth()) || {};
    const loginUserEmail = user?.email;
    const { branch, token, userName: owner, repo } = config;

    const { login, email } = await gitFetch("GET /user", {
      token,
    });

    const {
      object: { sha: parents },
    } = await gitFetch("GET /repos/{owner}/{repo}/git/ref/{ref}", {
      owner,
      token,
      repo,
      ref: "heads/" + branch,
    });

    const trees = files.map((file) => ({
      path: file.path,
      type: "blob",
      mode: "100644",
      sha: null,
    })) as ITree[];

    const treesData = await createTree(owner, repo, branch, token, trees);
    const postCommit = await createCommit(
      owner,
      repo,
      parents,
      treesData.sha,
      token,
      {
        email: email || loginUserEmail,
        name: login,
      },
      `delete files: ${files.map((file) => file.path).join(", ")}`,
    );
    const refs = await pushChanges(owner, repo, branch, token, postCommit.sha);
    return { trees, refs };
  } catch (error) {
    throw error;
  }
};

// create blob
export async function createBlob(
  file: { path: string; content: string },
  owner: string,
  repo: string,
  token: string,
) {
  return await gitFetch("POST /repos/{owner}/{repo}/git/blobs", {
    owner,
    token,
    repo,
    content: file.content,
    ...(checkMedia(file.path) && file.content && { encoding: "base64" }),
  });
}

// create Tree
export async function createTree(
  owner: string,
  repo: string,
  branch: string,
  token: string,
  tree: ITree[],
) {
  return await gitFetch("POST /repos/{owner}/{repo}/git/trees", {
    owner,
    repo,
    token,
    tree,
    base_tree: branch,
  });
}

// create commit
export async function createCommit(
  owner: string,
  repo: string,
  parents: string,
  sha: string,
  token: string,
  login: {
    email?: string | null;
    name?: string | null;
  },
  message?: string,
  description?: string,
) {
  const auth_details = {
    email: `${GITHUB_APP_NAME}[bot]@users.noreply.github.com`,
    name: `${GITHUB_APP_NAME}[bot]`,
  };

  const coAuthor = `Co-authored-by: ${login.name} <${login.email}>`;
  const commitMessage = `${message} by Sitepins${description ? `\n\n${description}` : ""}\n\n${coAuthor} `;

  return await gitFetch("POST /repos/{owner}/{repo}/git/commits", {
    owner,
    repo,
    token,
    message: commitMessage,
    tree: sha,
    author: auth_details,
    committer: auth_details,
    parents: [parents],
  });
}

// changes push
export async function pushChanges(
  owner: string,
  repo: string,
  branch: string,
  token: string,
  sha: string,
) {
  return await gitFetch("PATCH /repos/{owner}/{repo}/git/refs/{ref}", {
    owner,
    repo,
    token,
    ref: "heads/" + branch,
    force: true,
    sha: sha,
  });
}
