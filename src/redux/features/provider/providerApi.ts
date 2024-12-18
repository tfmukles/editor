import { api } from "../api-slice";
import { updateConfig } from "../config/slice";
import { Provider } from "./type";

export const providerApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProviders: builder.query<Provider[], string | undefined>({
      query: (userId) => {
        return {
          url: `/provider/${userId ?? ""}`,
          method: "GET",
        };
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const { data: providers } = await queryFulfilled;
        const selectedProvider = providers.find(
          (item) => item.provider === "Github",
        );
        dispatch(
          updateConfig({
            token: selectedProvider?.access_token!,
            installation_token: selectedProvider?.installation_access_token!,
            provider: "Github",
          }),
        );
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((provider) => ({
                type: "Providers" as const,
                id: provider._id,
              })),
              { type: "Providers", id: "LIST" },
            ]
          : [{ type: "Providers", id: "LIST" }],
    }),

    // Create a new provider
    createProvider: builder.mutation<Provider, Partial<Provider>>({
      query: (provider) => ({
        url: "/provider/create",
        method: "POST",
        body: provider,
      }),
      // Invalidate the providers cache to trigger a refetch
      invalidatesTags: ["Providers"],
    }),
  }),
});

export const { useGetProvidersQuery, useCreateProviderMutation } = providerApi;
