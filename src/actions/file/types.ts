import { configFormSchema, createFileSchema } from "@/lib/validate";
import { IFiles } from "@/types";
import { z } from "zod";
export type TImage = Omit<IFiles, "children" | "isFile" | "isNew" | "sha"> & {
  isAlreadyExit: boolean;
  content: string;
  isNew?: boolean;
  isReplace?: boolean;
  number: number;
};

export type NewImage<T = {}> = {
  variables: {
    images: TImage[];
  } & T;
};

export type FileCreateState<T = {}> = {
  variables: z.infer<typeof createFileSchema> & T;
  name: string;
};

export type ConfigFileState<T = {}> = {
  variables: z.infer<typeof configFormSchema> & T;
};

export type FileUpdateState<T = {}> = {
  variables: {
    data: any;
    path: string;
    message?: string;
    description?: string;
  } & T;
};
