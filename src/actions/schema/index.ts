"use server";

import { updateFiles } from "@/actions/commit";
import { ExtractVariables, SubmitFormState, mutate } from "@/actions/utils";
import { SCHEMA_FOLDER } from "@/lib/constant";
import { extractFolderName } from "@/lib/utils/generateSchema";
import { createSchema } from "@/lib/validate";
import { IConfig } from "@/types";
import { SchemaCreateState } from "./types";

export async function onSchemaCreate(
  prevState: SubmitFormState<SchemaCreateState>,
  data: ExtractVariables<
    SchemaCreateState<{
      config: IConfig;
    }>
  >,
): Promise<SubmitFormState<SchemaCreateState>> {
  const parsed = createSchema.safeParse(data);
  if (!parsed.success) {
    return {
      data: null,
      error: [],
      message: "Invalid form data",
      isSuccess: false,
      isError: true,
      statusCode: 500,
    };
  }

  const { pathname } = data.config;
  const schemaName = extractFolderName(pathname!);

  if (!schemaName) {
    return {
      data: null,
      error: [],
      message: "Invalid schema name",
      isSuccess: false,
      isError: true,
      statusCode: 500,
    };
  }

  return await mutate(async () => {
    await updateFiles({
      files: [
        {
          path: SCHEMA_FOLDER + "/" + schemaName + ".json",
          content: JSON.stringify(
            {
              file: data.file,
              name: schemaName,
              fileType: data.fileType,
              fmType: data.fmType,
              template: data.template,
            },
            null,
            2,
          ),
        },
      ],
      message: `Create Schema ${data.file}`,
      shouldRevalidate: false,
      config: data.config,
    });

    return {
      body: {
        message: "Schema created successfully!",
        result: {
          ...data,
          name: schemaName,
        },
      },
      status: 200,
    };
  });
}
