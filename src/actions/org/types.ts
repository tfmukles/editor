import { orgSchema } from "@/lib/validate";
import { z } from "zod";
type Role = "editor" | "admin";

export type Member = {
  role: Role;
  _id: string;
  full_name: string;
  image: string;
  email: string;
  user_id: string;
  delete?: boolean;
};

export type Org<T = z.infer<typeof orgSchema> & { org_id?: string }> = {
  org_name: string;
  org_id: string;
  owner: string;
  org_image?: string;
  members: Member[];
  projectCount: number;
  default: boolean;
  variables: T;
};
