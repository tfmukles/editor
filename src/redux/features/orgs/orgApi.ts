import { Org } from "@/actions/org/types";
import { api } from "../api-slice";

export const orgApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all organizations
    getOrgs: builder.query<Org[], void>({
      query: () => ({
        method: "GET",
        url: "/organization/user",
      }),
      providesTags: ["Orgs"],
    }),

    // Get single organizpapiation
    getOrg: builder.query<Org, string>({
      query: (id) => ({
        method: "GET",
        url: `/organization/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: "Org" as const, id }],
    }),

    // Add new organization
    addOrg: builder.mutation<Org, Partial<Org>>({
      query: (orgData) => ({
        url: "/organization",
        method: "POST",
        body: orgData,
      }),
      // Invalidate the Orgs tag to refetch the list
      invalidatesTags: ["Orgs"],
    }),

    // Update organization
    updateOrg: builder.mutation<Org, Partial<Org>>({
      query: (orgData) => ({
        url: `/organization/${orgData.org_id || orgData.org_id}`,
        method: "PATCH",
        body: orgData,
      }),
      // Invalidate both the specific Org and the Orgs list
      invalidatesTags: (result, error, { org_id }) => [
        "Orgs",
        { type: "Org", id: org_id },
      ],
    }),

    // Delete organization
    deleteOrg: builder.mutation<Org, string>({
      query: (id) => ({
        url: `/organization/${id}`,
        method: "DELETE",
      }),
      // Invalidate both the specific Org and the Orgs list
      invalidatesTags: (result, error, id) => ["Orgs", { type: "Org", id }],
    }),
  }),
});

// Export hooks for components to use
export const {
  useGetOrgsQuery,
  useGetOrgQuery,
  useAddOrgMutation,
  useUpdateOrgMutation,
  useDeleteOrgMutation,
} = orgApi;
