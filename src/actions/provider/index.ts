"use server";

import { auth } from "@/auth";
import { revalidateTag } from "next/cache";
import { InsertionSuccess, fetchApi } from "../utils";
import { Provider } from "./types";

export const getProviders = async (userId?: string) => {
  const { user } = (await auth()) || {};
  const providers = await fetchApi<InsertionSuccess<Provider[]>>({
    endPoint: `/provider/${userId ?? user?.id}`,
    method: "GET",
    cache: "no-store",
    tags: ["providers"],
  });

  return providers.body.result;
};

export const createProvider = async (provider: Provider) => {
  const providers = await fetchApi<
    InsertionSuccess<
      Provider & {
        variables: Provider;
      }
    >
  >({
    endPoint: "/provider/create",
    method: "POST",
    body: {
      ...provider,
    },
  });

  revalidateTag("providers");
  return providers.body.result;
};
