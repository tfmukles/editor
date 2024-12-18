"use server";

import { Endpoints } from "@octokit/types";
import { Octokit, RequestError } from "octokit";
import { cache } from "react";
import "server-only";

export type GitHubEndpoint = keyof Endpoints;
export type GithubPromise<E extends GitHubEndpoint> =
  Endpoints[E]["response"]["data"];
export type GithubOption<E extends GitHubEndpoint> =
  Endpoints[E]["parameters"] & { format?: "base64" };

function decodeBase64(data: string): string {
  if (!data) return "";
  return Buffer.from(data, "base64").toString("utf-8");
}

export const gitFetch = async <E extends GitHubEndpoint>(
  endPoint: E,
  options: GithubOption<E> & {
    token: string;
    json?: boolean;
  },
): Promise<GithubPromise<E>> => {
  let { token, ...rest } = options;
  const optionsWithHeaders = {
    ...rest,
    headers: {
      "If-None-Match": "",
    },
  };

  try {
    const octokit = new Octokit({
      auth: token,
    });

    const { data } = await octokit.request(endPoint, optionsWithHeaders);

    // Process data only once based on 'format'
    if (options.format === "base64" && data.content) {
      const decodedContent = decodeBase64(data.content);
      return options.json ? JSON.parse(decodedContent) : decodedContent;
    }
    return data;
  } catch (error) {
    if (error instanceof RequestError && error.status === 401) {
      throw new Error("Failed to refresh token");
    }
    throw error;
  }
};

export const gitFetchWithCache = cache(gitFetch);
