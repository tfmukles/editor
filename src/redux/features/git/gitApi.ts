import { RootState } from "@/redux/store";
import { Octokit } from "@octokit/rest";
import { BaseQueryFn } from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";
import { RequestError } from "octokit";
import { GitHubEndpoint, GitHubOption } from "./type";

const octokitBaseQuery: BaseQueryFn<
  {
    endpoint: GitHubEndpoint;
    options: GitHubOption<GitHubEndpoint>;
  },
  unknown,
  { status: number; message: string }
> = async ({ endpoint, options }, { getState }) => {
  try {
    const { config } = getState() as RootState;
    const octokit = new Octokit({
      auth: config.token,
    });
    const response = await octokit.request(endpoint, {
      ...options,
      headers: {
        "If-None-Match": "",
      },
    });
    return { data: response.data };
  } catch (error) {
    if (error instanceof RequestError) {
      return {
        status: error.status || 500,
        message: error.message,
      };
    } else if (error instanceof Error) {
      return {
        error: {
          status: 500,
          message: error.message,
        },
      };
    } else {
      return {
        error: {
          status: 500,
          message: "Unknown error",
        },
      };
    }
  }
};

export const githubApi = createApi({
  reducerPath: "githubApi",
  baseQuery: octokitBaseQuery,
  tagTypes: ["commit", "Files"],
  endpoints: (builder) => ({}),
});
