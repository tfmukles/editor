import { projectSchema } from "@/lib/validate";
import { z } from "zod";

export type Project<
  T = z.infer<typeof projectSchema> & {
    org_id?: string;
    project_id?: string;
  },
> = {
  _id: string;
  project_id: string;
  project_name: string;
  provider: "Github" | "Gitlab";
  repository: string;
  project_image?: string;
  gth_name: string;
  branch: string;
  user_id: string;
  org_id: string;
  variables: T;
};
