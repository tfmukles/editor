"use server";

import { getProject } from "@/actions/project";
import { auth } from "@/auth";
import { API_URL, Token } from "@/lib/constant";
import { CustomApiError } from "@/lib/utils/error";
import { revalidatePath, revalidateTag } from "next/cache";
import { getProviders } from "../provider";

export const selectedRepoDetails = async ({
  projectId,
  orgId,
}: {
  projectId: string;
  orgId: string;
}) => {
  const project = await getProject({ projectId, orgId: orgId.slice(4) });
  const providers = await getProviders(project?.user_id!);
  const selectedProvider = providers.find((item) => item.provider === "Github");
  const [userName, repoName] = project?.repository?.split("/") as string[];
  return {
    userName,
    repoName,
    projectId,
    orgId: orgId.slice(4),
    token: selectedProvider?.access_token!,
    installation_token: selectedProvider?.installation_access_token!,
    provider: selectedProvider?.provider!,
    branch: project?.branch!,
  };
};

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ExtractVariables<T> = T extends { variables: object }
  ? T["variables"]
  : never;

export type SubmitFormState<T> = {
  data: Omit<T, "variables"> | null;
  error: {
    path: string;
    message: string;
  }[];
  message: string | null;
  isError: boolean;
  isSuccess: boolean;
  statusCode: number | null;
};

export type InsertionSuccess<T> = {
  success: true;
  message: "data inserted successfully";
  result: T;
} & {
  variables: ExtractVariables<T>;
};

export async function fetchApi<T>({
  endPoint,
  cache = "force-cache",
  headers = {},
  tags = [],
  body,
  method = "GET",
}: {
  endPoint: string;
  cache?: RequestCache;
  headers?: HeadersInit;
  tags?: string[];
  body?: ExtractVariables<T> | FormData;
  method?: HttpMethod;
}): Promise<{ status: number; body: Omit<T, "variables"> }> {
  try {
    const { user } = (await auth()) || {};
    const headersObj = {
      "Content-Type": "application/json",
      authorization_token: `Bearer ${Token}`,
      ...(user?.accessToken && {
        authorization: `Bearer ${user?.accessToken}`,
      }),
      ...headers,
    };

    if (body instanceof FormData) {
      // @ts-ignore
      delete headersObj["Content-Type"];
    }

    const requestBody =
      body instanceof FormData
        ? body
        : typeof body === "string"
          ? body
          : JSON.stringify(body);

    const result = await fetch(API_URL + endPoint, {
      method,
      headers: headersObj,
      ...(method !== "GET" && { body: requestBody }),
      cache,
      ...(tags.length > 0 && { next: { tags } }),
    });

    const responseBody = await result.json();

    if (!result.ok) {
      const customError = new CustomApiError(
        result.status,
        responseBody?.message,
        responseBody?.errorMessage ?? [],
      );
      throw customError;
    }

    return {
      status: result.status,
      body: responseBody,
    };
  } catch (error) {
    throw error;
  }
}

export async function mutate<T>(
  callback: () => Promise<any>,
): Promise<SubmitFormState<T>> {
  try {
    const { body, status } = (await callback()) || {};
    return {
      data: body.result as T,
      error: [],
      message: body.message,
      isError: false,
      isSuccess: true,
      statusCode: status,
    };
  } catch (err) {
    console.log(err);
    if (err instanceof CustomApiError) {
      return {
        data: null,
        isError: true,
        isSuccess: false,
        error: err.errorMessage,
        message: err.message,
        statusCode: err.statusCode,
      };
    }

    if (err instanceof Error) {
      return {
        data: null,
        isError: true,
        isSuccess: false,
        error: [],
        message: err.message,
        statusCode: 500,
      };
    }

    return {
      data: null,
      isError: true,
      isSuccess: false,
      error: [],
      message: "Something went wrong",
      statusCode: 500,
    };
  }
}

export const revalidateRefresh = async (
  paths: { originalPath: string; type?: "layout" | "page" | "tag" }[],
) => {
  paths.forEach(({ originalPath, type }) => {
    if (type === "tag") {
      revalidateTag(originalPath);
      return;
    }
    revalidatePath(originalPath, type);
  });
};
