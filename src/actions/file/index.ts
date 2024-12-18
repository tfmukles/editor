"use server";

import { deleteFiles, updateFiles } from "@/actions/commit";
import { getContent, getTrees } from "@/actions/project-config";
import { ExtractVariables, SubmitFormState, mutate } from "@/actions/utils";
import { convertToFormData } from "@/components/SchemaGenerate";
import { SCHEMA_FOLDER } from "@/lib/constant";
import { findFileByPath, sanitizedPath } from "@/lib/utils/common";
import { contentFormatter } from "@/lib/utils/contentFormatter";
import { extractFolderName } from "@/lib/utils/generateSchema";
import { slugify } from "@/lib/utils/textConverter";
import { createFileSchema } from "@/lib/validate";
import { IConfig } from "@/types";
import { revalidateTag } from "next/cache";
import path from "path";
import {
  ConfigFileState,
  FileCreateState,
  FileUpdateState,
  NewImage,
} from "./types";

const isGroupNameExit = (pathname: string, config: IConfig) => {
  const folder = pathname.split("files/")?.[1];

  const arrangements = config?.arrangement ?? [];
  const { dir, base } = path.parse(folder);

  const arrangement = arrangements.find(
    (arrangement) =>
      slugify(arrangement.groupName) === base &&
      arrangement.type === "folder" &&
      arrangement.targetPath === dir,
  );

  const groupName = arrangement?.groupName;
  const filepath = groupName ? folder.replace(base, "") : folder;

  return filepath;
};

// on file create
export async function onFileCreate(
  prevState: SubmitFormState<FileCreateState>,
  data: ExtractVariables<
    FileCreateState<{
      config: IConfig;
    }>
  >,
): Promise<SubmitFormState<FileCreateState>> {
  const parsed = createFileSchema.safeParse(data);
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

  return await mutate(async () => {
    const {
      pathname,
      branch,
      userName,
      repo: repoName,
      projectId,
      orgId,
    } = data.config;
    const schemaDir =
      SCHEMA_FOLDER + "/" + extractFolderName(pathname!) + ".json";
    const filepath = await isGroupNameExit(pathname!, data.config);
    const content = (await getContent({
      path: schemaDir,
      json: true,
      projectId: projectId,
      orgId: orgId,
    })) as Record<string, any>;

    const newFileText = contentFormatter({
      data: convertToFormData(content.template, data.title),
      page_content: content?.content || "",
      format: content.fmType,
    });

    // upload files
    await updateFiles({
      files: [
        {
          path: path.join(
            filepath,
            slugify(data.name) + "." + content.fileType,
          ),
          content: newFileText,
        },
      ],
      config: data.config,
      message: `${data.name} created`,
    });

    // revalidate trees;
    revalidateTag(`trees-${userName}-${repoName}-${branch}-${projectId}`);

    return {
      body: {
        message: "file  created successfully!",
        result: {
          name: path.join(
            filepath,
            slugify(data.name) + "." + content.fileType,
          ),
        },
      },
      status: 200,
    };
  });
}

// update file
export async function onFileUpdate(
  prevState: SubmitFormState<FileUpdateState>,
  data: ExtractVariables<
    FileUpdateState<{
      config: IConfig;
    }>
  >,
): Promise<SubmitFormState<FileUpdateState>> {
  return await mutate(async () => {
    try {
      await updateFiles({
        files: [
          {
            path: data.path,
            content: data.data,
          },
        ],
        config: data.config,
        message: data.message || `${data.path} updated`,
        description: data.description,
        shouldRevalidate: false,
      });

      return {
        body: {
          message: "file updated successfully!",
          result: {
            name: data.path,
          },
        },
        status: 200,
      };
    } catch (error) {
      return {
        body: {
          data: null,
          error: [],
          message: "Something went wrong",
          isSuccess: false,
          isError: true,
          statusCode: 500,
        },
      };
    }
  });
}

// duplicate files
export async function onFileDuplicate(
  prevState: SubmitFormState<FileCreateState>,
  data: ExtractVariables<
    FileCreateState<{
      config: IConfig;
    }>
  >,
): Promise<SubmitFormState<FileCreateState>> {
  const parsed = createFileSchema.safeParse(data);

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

  return await mutate(async () => {
    const { projectId, orgId } = data.config;

    const { dir, name, ext } = path.parse(data.name);
    const trees = await getTrees({
      projectId,
      orgId,
    });

    const currentFolderFiles = findFileByPath(
      trees[0].children!,
      sanitizedPath("files", dir),
    );

    const number: number = Math.max(
      ...(currentFolderFiles?.children?.reduce<number[]>(
        (acc, curr) => {
          const regex = /_copy_(\d+)/;
          const fileName = path.parse(curr.path).name;
          const match = fileName.match(regex);
          if (match) {
            const [, number] = match;
            const extractedNumber = number ? parseInt(number, 10) : 0;
            return [...acc, extractedNumber];
          }
          return acc;
        },
        [0],
      ) || [0]),
    );

    const content = await getContent({
      path: data.name,
      projectId,
      orgId,
    });

    const newPath = `${dir}/${name}_copy_${number + 1}${ext}`;
    await updateFiles({
      files: [
        {
          path: newPath,
          content: content,
        },
      ],
      shouldRevalidate: false,
      message: `${data.name} created`,
      config: data.config,
    });

    return {
      body: {
        message: "file created successfully!",
        result: {
          name: newPath,
        },
      },
      status: 200,
    };
  });
}

// rename file
export async function onFileRename(
  prevState: SubmitFormState<FileCreateState<{ originalName: string }>>,
  data: ExtractVariables<
    FileCreateState<{
      config: IConfig;
      originalName: string;
    }>
  >,
): Promise<SubmitFormState<FileCreateState<{ originalName: string }>>> {
  const parsed = createFileSchema.safeParse(data);
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

  return await mutate(async () => {
    const {
      pathname,
      branch,
      userName,
      repo: repoName,
      projectId,
      orgId,
    } = data.config;
    const filepath = isGroupNameExit(pathname!, data.config);
    const content = await getContent({
      path: path.join(filepath, data.originalName),
      projectId,
      orgId,
    });
    await updateFiles({
      files: [
        {
          path: path.join(filepath, data.originalName),
          content: "",
        },
        {
          path: path.join(
            filepath,
            data.name + path.extname(data.originalName),
          ),
          content: content,
        },
      ],
      shouldRevalidate: false,
      message: `${data.originalName} renamed`,
      config: data.config,
    });

    return {
      body: {
        message: "file renamed successfully!",
        result: {
          name: path.join(
            filepath,
            data.name + path.extname(data.originalName),
          ),
        },
      },
      status: 200,
    };
  });
}

// delete file
export async function onFileDelete(
  prevState: SubmitFormState<FileCreateState>,
  data: ExtractVariables<
    FileCreateState<{
      config: IConfig;
    }>
  >,
): Promise<SubmitFormState<FileCreateState>> {
  const parsed = createFileSchema.safeParse(data);
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
  const filepath = isGroupNameExit(pathname!, data.config);

  return await mutate(async () => {
    await deleteFiles({
      files: [
        {
          path: path.join(filepath, data.name),
          content: "",
        },
      ],
      config: data.config,
    });

    return {
      body: {
        message: "file deleted successfully!",
        result: {
          ...data,
        },
      },
      status: 200,
    };
  });
}

// new folder create
export async function onFolderCreate(
  prevState: SubmitFormState<FileCreateState>,
  data: ExtractVariables<
    FileCreateState<{
      config: IConfig;
    }>
  >,
): Promise<SubmitFormState<FileCreateState>> {
  const { pathname } = data.config;
  const parsed = createFileSchema.safeParse(data);

  if (!parsed.success) {
    return {
      message: "Invalid form data",
      data: null,
      error: [],
      isError: true,
      isSuccess: false,
      statusCode: 500,
    };
  }

  if (!parsed.success) {
    return {
      message: "Invalid form data",
      data: null,
      error: [],
      isError: true,
      isSuccess: false,
      statusCode: 500,
    };
  }

  return await mutate<FileCreateState>(async () => {
    const folder = pathname!.split("media/")?.[1];
    const dir = folder + "/" + data.name + "/" + ".gitkeep";
    await updateFiles({
      files: [
        {
          path: dir,
          content: "",
        },
      ],
      message: `${data.name} created`,
      createFolder: true,
      shouldRevalidate: false,
      config: data.config,
    });

    return {
      body: {
        message: "folder created successfully!",
        result: {
          name: dir,
        },
      },
      status: 200,
    };
  });
}

// on image upload
export async function uploadImage(
  prevState: SubmitFormState<NewImage>,
  data: ExtractVariables<
    NewImage<{
      config: IConfig;
    }>
  >,
): Promise<SubmitFormState<NewImage>> {
  const images = data.images;
  return await mutate(async () => {
    await updateFiles({
      files: images,
      message: images.map((item) => item.name).join(", ") + " Uploaded",
      shouldRevalidate: false,
      config: data.config,
    });

    return {
      body: {
        message: "image uploaded successfully!",
        result: images,
      },
      status: 200,
    };
  });
}

// create and update config
export async function onUpdateConfig(
  prevState: SubmitFormState<ConfigFileState>,
  data: ExtractVariables<
    ConfigFileState<{
      config: IConfig;
    }>
  >,
): Promise<SubmitFormState<ConfigFileState>> {
  return await mutate(async () => {
    const media_root = data?.media_root?.value;
    const slashIndex = media_root.lastIndexOf("/");
    const media_public =
      slashIndex !== -1 ? media_root.substring(0, slashIndex) : media_root;

    const payload = {
      media: {
        root: media_root,
        public: media_public,
      },
      content: {
        root: data.content_root.value,
      },
      themeConfig: data.themeConfigurations,
      arrangement: data?.arrangement ?? [],
      showCommitModal: data.showCommitModal,
    };

    await updateFiles({
      files: [
        {
          path: ".sitepins/config.json",
          content: JSON.stringify(payload, null, 2),
        },
      ],
      message: `config file created`,
      shouldRevalidate: false,
      config: data.config,
    });

    return {
      body: {
        message: "config file created successfully!",
        result: {
          name: ".sitepins/config.json",
          data: payload,
        },
      },
      status: 200,
    };
  });
}
