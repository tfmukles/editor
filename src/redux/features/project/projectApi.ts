import { projectSchema } from "@/lib/validate";
import { api } from "../api-slice";
import { updateConfig } from "../config/slice";
import { Project } from "./type";

export const projectApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query<Project[], string>({
      query: (orgId) => ({
        method: "GET",
        url: `/project/orgs/${orgId}`,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ project_id }) => ({
                type: "Project" as const,
                id: project_id,
              })),
              { type: "Projects", id: "LIST" },
            ]
          : [{ type: "Projects", id: "LIST" }],
    }),

    // Get a single project
    getProject: builder.query<Project, { projectId: string; orgId: string }>({
      query: ({ projectId, orgId }) => ({
        method: "GET",
        url: `/project/${projectId}?orgId=${orgId}`,
      }),

      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          const [userName, repoName] = data?.repository?.split("/") as string[];
          dispatch(
            updateConfig({
              userName,
              repo: repoName,
              branch: data.branch,
            }),
          );
        } catch (error) {}
      },
      providesTags: (result, error, { projectId }) =>
        result ? [{ type: "Project" as const, id: projectId }] : [],
    }),

    // Add new project with Zod validation
    addProject: builder.mutation<Project, Partial<Project>>({
      query: (projectData) => {
        // Perform Zod validation
        const validated = projectSchema.safeParse(projectData);

        if (!validated.success) {
          // Throw validation error
          throw new Error(JSON.stringify(validated.error.errors));
        }

        return {
          url: "/project/create",
          method: "POST",
          body: projectData,
          cache: "no-cache",
        };
      },
      invalidatesTags: ["Projects", "Project"],
      // Optional: transform response or handle side effects
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {}
      },
    }),

    // Update project
    updateProject: builder.mutation<Project, Partial<Project>>({
      query: (projectData) => {
        const { project_id, org_id, ...rest } = projectData;

        return {
          url: `/project/${project_id}?orgId=${org_id}`,
          method: "PATCH",
          body: rest,
        };
      },
      invalidatesTags: (result, error, { project_id }) => [
        "Projects",
        { type: "Project", id: project_id },
      ],
    }),

    // Delete project
    deleteProject: builder.mutation<Project, { id: string; org_id: string }>({
      query: ({ id, org_id }) => ({
        url: `/project/${id}?orgId=${org_id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => [
        "Projects",
        "Orgs",
        { type: "Project", id },
      ],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useAddProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectApi;
