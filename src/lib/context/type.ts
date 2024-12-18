import { IConfig, IFiles } from "@/types";
import { Dispatch, SetStateAction } from "react";

export type context = {
  files: IFiles[];
  config: IConfig;
  userName: string;
  repoName: string;
  branch: string;
  isRawMode: boolean;
  setRawMode: Dispatch<SetStateAction<boolean>>;
};

export type State = {
  data: {
    [index: string]: any;
  };

  images: Array<{
    path: string;
    content: string;
  }>;
  page_content: string;
};
