import { Endpoints } from "@octokit/types";
import { LucideIcon } from "lucide-react";

export type User = {
  userName: string;
  token: string;
  provider?: string;
};

export type IContent = {
  type: "dir" | "file" | "submodule" | "symlink";
  content?: string | undefined;
  git_url: string | null;
  html_url: string | null;
  download_url: string | null;
  encoding: "base64";
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  _links: {} | {}[] | {} | {} | {};
};

export type ITree =
  Endpoints["POST /repos/{owner}/{repo}/git/trees"]["parameters"]["tree"][0];

export interface IFiles {
  name: string;
  sha: string | null;
  path: string;
  isFile: boolean;
  children?: IFiles[];
  isNew?: boolean;
  isReplace?: boolean;
  type?: string;
  realPath?: string;
}

export interface IArrangement extends IFiles {
  folder?: string;
  include?: string;
  exclude?: string;
  weight?: number;
}

export type IFileMangeAction = {
  type: "modify-files";
  payload: IFiles[];
};
export interface ISelectedFile {
  name: string;
  path: string;
  isFile: boolean;
  sha: string;
  children?: ISelectedFile[];
}

export type ISelectFileAction = {
  type: "select";
  payload: ISelectedFile[];
};

export interface IFileInitialState {
  files: IFiles[];
}

export interface ISchema {
  name: string;
  type: "document" | "list";
  include: string[];
  exclude: string[];
}

export type Arrangement =
  | {
      id: string;
      type: "folder";
      targetPath: string; // This is why we need path, not folder
      groupName: string;
      include: string;
      exclude: string;
    }
  | {
      id: string;
      type: "file" | "heading";
      targetPath: string;
      groupName: string;
    };

export type IConfig = {
  provider: "Github" | "Gitlab";
  installation_token: string;
  token: string;
  userName: string;
  token: string;
  repo: string;
  branch: string;
  environment: "nextjs" | "astro" | "hugo";
  content: {
    root: string;
  };
  media: {
    root: string;
    public: string;
  };
  themeConfig: string[];
  arrangement: Arrangement[];
  isRawMode: boolean;
  showCommitModal: boolean;
};

export type ConfigAction = { type: "setConfig"; payload: IConfig };

type MenuItem = {
  name: string;
  href: ((href: string) => string) | string;
  icon: LucideIcon;
};
