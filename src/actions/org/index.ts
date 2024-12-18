"use server";

import { revalidateTag } from "next/cache";
import {
  ExtractVariables,
  InsertionSuccess,
  SubmitFormState,
  fetchApi,
  mutate,
} from "../utils";
import { Org } from "./types";

export const getOrgs = async () => {
  const { body } = await fetchApi<InsertionSuccess<Org[]>>({
    endPoint: "/organization/user",
    method: "GET",
    tags: ["orgs"],
  });
  return body.result;
};

// get single org
export const getOrg = async (id: string) => {
  const { body } = await fetchApi<InsertionSuccess<Org>>({
    endPoint: `/organization/${id}`,
    method: "GET",
    tags: [`org-${id}`],
  });
  return body.result;
};

// add new org
export const addOrg = async (
  prevState: SubmitFormState<Org>,
  data: ExtractVariables<Org>,
) => {
  return await mutate<Org>(async () => {
    const newOrg = await fetchApi<InsertionSuccess<Org>>({
      endPoint: "/organization",
      method: "POST",
      cache: "no-cache",
      body: {
        ...data,
      },
    });
    revalidateTag("orgs");
    return newOrg;
  });
};

// update org
export const updateOrg = async (
  prevState: SubmitFormState<Org>,
  data: ExtractVariables<Org>,
) => {
  return await mutate<Org>(async () => {
    const { org_id } = data;
    const updatedOrg = await fetchApi<InsertionSuccess<Org>>({
      endPoint: `/organization/${org_id}`,
      method: "PATCH",
      body: data,
      cache: "no-cache",
    });
    revalidateTag(`org-${org_id}`);
    revalidateTag("orgs");
    return updatedOrg;
  });
};

// delete org
export const deleteOrg = async (
  prevState: SubmitFormState<Org<{ id: string }>>,
  data: ExtractVariables<Org<{ id: string }>>,
) => {
  return await mutate<Org>(async () => {
    const deletedOrg = await fetchApi<InsertionSuccess<Org>>({
      endPoint: `/organization/${data.id}`,
      method: "DELETE",
    });

    revalidateTag(`org-${data.id}`);
    revalidateTag("orgs");
    return deletedOrg;
  });
};
