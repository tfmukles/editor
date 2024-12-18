import { API_URL, Token } from "@/lib/constant";
import { BaseQueryFn, createApi } from "@reduxjs/toolkit/query/react";
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { getSession } from "next-auth/react";

const axiosBaseQuery =
  (
    { baseUrl }: { baseUrl: string } = { baseUrl: "" },
  ): BaseQueryFn<
    {
      url: string;
      method?: AxiosRequestConfig["method"];
      data?: AxiosRequestConfig["data"];
      params?: AxiosRequestConfig["params"];
      headers?: AxiosRequestConfig["headers"];
    },
    unknown,
    unknown
  > =>
  async ({ url, method, data, params, headers }) => {
    try {
      const token = await getSession();
      headers = {
        ...headers,
        authorization_token: `Bearer ${Token}`,
      };
      if (token?.user) {
        headers = {
          ...headers,
          authorization: `Bearer ${token.user.accessToken}`,
        };
      }
      const result = await axios({
        url: baseUrl + url,
        method,
        data,
        params,
        headers,
      });
      return { data: result.data.result };
    } catch (axiosError) {
      const err = axiosError as AxiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };

export const api = createApi({
  reducerPath: "api",
  tagTypes: ["Orgs", "Org", "Projects", "Project", "Providers"],
  baseQuery: axiosBaseQuery({
    baseUrl: API_URL!,
  }),
  endpoints: (builder) => ({}),
});
