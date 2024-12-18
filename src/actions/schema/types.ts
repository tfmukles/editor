import { createSchema } from "@/lib/validate";
import { z } from "zod";

export type SchemaCreateState<T = {}> = {
  variables: z.infer<typeof createSchema> & T;
};
