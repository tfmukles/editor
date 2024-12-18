import { IConfig } from "@/types";
import path from "path";
import { slugify } from "./textConverter";

export const isGroupNameExit = (pathname: string, config: IConfig) => {
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
