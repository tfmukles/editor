"use server";

import { projectSchema } from "@/lib/validate";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import * as z from "zod";
import {
  ExtractVariables,
  InsertionSuccess,
  SubmitFormState,
  fetchApi,
  mutate,
} from "../utils";
import { Project } from "./types";

export const addProject = async (
  prevState: SubmitFormState<Project>,
  data: ExtractVariables<Project>,
): Promise<SubmitFormState<Project>> => {
  const cookieStore = await cookies();
  const validated = projectSchema.safeParse(data);
  if (!validated.success) {
    return {
      data: null,
      error: [],
      message: null,
      isError: true,
      isSuccess: false,
      statusCode: null,
    };
  }

  return await mutate(async () => {
    const newProject = await fetchApi<
      InsertionSuccess<
        Project & {
          variables: z.infer<typeof projectSchema> & {
            org_id: string;
          };
        }
      >
    >({
      endPoint: `/project/create`,
      method: "POST",
      // @ts-ignore
      body: data,
      cache: "no-cache",
    });
    cookieStore.set("skip", "true");
    revalidateTag("orgs");
    revalidateTag("projects");
    (await cookies()).delete("token");
    return newProject;
  });
};

export const getProjects = async (orgId: string) => {
  const { body } = await fetchApi<InsertionSuccess<Project[]>>({
    endPoint: `/project/orgs/${orgId}`,
    method: "GET",
    tags: [`projects`],
  });
  return body.result;
};

export const getProject = async ({
  projectId,
  orgId,
}: {
  projectId: string;
  orgId: string;
}) => {
  if (!projectId) return;
  const { body } = await fetchApi<InsertionSuccess<Project>>({
    endPoint: `/project/${projectId}?orgId=${orgId}`,
    method: "GET",
    tags: ["projects", `project-${projectId}`],
  });
  return body.result;
};

export const updateProject = async (
  prevState: SubmitFormState<Project>,
  data: ExtractVariables<Project>,
): Promise<SubmitFormState<Project>> => {
  const { project_id, org_id } = data;
  return await mutate<Project>(async () => {
    const updatedOrg = await fetchApi<InsertionSuccess<Project>>({
      endPoint: `/project/${project_id}?orgId=${org_id}`,
      method: "PATCH",
      body: data,
    });

    revalidateTag(`project-${project_id}`);
    revalidateTag("projects");
    return updatedOrg;
  });
};

export const deleteProject = async (
  prevState: SubmitFormState<Project<{ id: string; org_id: string }>>,
  data: ExtractVariables<Project<{ id: string; org_id: string }>>,
) => {
  return await mutate<Project>(async () => {
    const deletedOrg = await fetchApi<InsertionSuccess<Project>>({
      endPoint: `/project/${data.id}?orgId=${data.org_id}`,
      method: "DELETE",
    });
    revalidateTag("orgs");
    revalidateTag(`project-${data.id}`);
    revalidateTag("projects");
    return deletedOrg;
  });
};

export const moveProject = async (
  prevState: SubmitFormState<Project<{ id: string; org_id: string }>>,
  data: ExtractVariables<Project<{ id: string; org_id: string }>>,
): Promise<SubmitFormState<Project<{ id: string; org_id: string }>>> => {
  return await mutate<Project>(async () => {
    const updatedOrg = await fetchApi<Project>({
      endPoint: `/project/${data.id}/move-to/${data.org_id}`,
      method: "PATCH",
      cache: "no-cache",
    });
    revalidateTag(`project-${data.id}`);
    revalidateTag("orgs");
    revalidateTag("projects");
    return updatedOrg;
  });
};
