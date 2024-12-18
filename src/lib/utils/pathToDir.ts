import { checkMedia } from "@/lib/utils/checkMediaFile";
import { sanitizedPath } from "@/lib/utils/common";
import { IConfig, IFiles, ITree } from "@/types";

const formatPathsIntoDir = ({
  files,
  paths,
  sha,
  filePath,
  type,
  url,
}: {
  files: IFiles[];
  paths: string;
  sha: string | null;
  filePath: string;
  type?: "media" | "file" | "config";
  url: string;
}) => {
  let currentLevel = files;
  const isMediaDir = checkMedia(filePath);
  const pathsArray = paths.split("/");

  for (let index = 0; index < pathsArray.length; index++) {
    const item = pathsArray[index];
    const isDirectory = !item.includes(".");
    const existingEntry = currentLevel.find((entry) => entry.name === item);

    if (item === ".gitkeep") {
      continue;
    }

    if (type === "media") {
      if (filePath.includes(url)) {
        if (!existingEntry) {
          const newNode: IFiles = {
            name: item,
            path: `media/${pathsArray.slice(0, index + 1).join("/")}`,
            sha: sha,
            isFile: !isDirectory,
          };

          if (isDirectory) {
            newNode.children = [];
          }

          currentLevel.push(newNode);
          currentLevel = isDirectory ? newNode.children! : currentLevel;
        } else {
          currentLevel = isDirectory ? existingEntry.children! : currentLevel;
        }
      }
    } else {
      const isFile =
        type === "config"
          ? //@ts-ignore
            url?.some((item) => {
              return filePath.startsWith(item);
            })
          : filePath.startsWith(sanitizedPath(url, "")) && !isMediaDir;

      if (isFile) {
        if (!existingEntry) {
          const newNode: IFiles = {
            name: item,
            path: `files/${pathsArray.slice(0, index + 1).join("/")}`,
            sha: sha,
            isFile: !isDirectory,
          };

          if (isDirectory) {
            newNode.children = [];
          }

          currentLevel.push(newNode);
          currentLevel = isDirectory ? newNode.children! : currentLevel;
        } else {
          currentLevel = isDirectory ? existingEntry.children! : currentLevel;
        }
      }
    }
  }
};

export const pathToDir = (repoFiles: ITree[], config: IConfig): IFiles[] => {
  const files: IFiles[] = [];
  const images: IFiles[] = [];
  const themeConfig: IFiles[] = [];
  const mediaUrl = config?.media?.public;
  const contentUrl = config?.content?.root?.endsWith("/")
    ? config?.content?.root
    : config?.content?.root
      ? `${config.content.root}/`
      : "src/content/";

  const themeConfigUrl = config?.themeConfig;

  for (let i = 0; i < repoFiles.length; i++) {
    const tree = repoFiles[i];
    const { path, sha } = tree;

    formatPathsIntoDir({
      files,
      paths: path!,
      sha: sha!,
      filePath: path!,
      type: "file",
      url: contentUrl,
    });

    formatPathsIntoDir({
      files: images,
      paths: path!,
      filePath: path!,
      sha: sha!,
      type: "media",
      url: mediaUrl,
    });

    formatPathsIntoDir({
      files: themeConfig,
      paths: path!,
      filePath: path!,
      sha: sha!,
      type: "config",
      //@ts-ignore
      url: themeConfigUrl,
    });
  }

  return [
    {
      name: "root",
      sha: "",
      path: "files",
      isFile: false,
      children: files,
    },
    {
      name: "media",
      sha: "",
      path: "media",
      isFile: false,
      children: images,
    },
    {
      name: "config",
      sha: "",
      path: "config",
      isFile: false,
      children: themeConfig,
    },
  ];
};
