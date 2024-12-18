"use client";

import { selectConfig, updateConfig } from "@/redux/features/config/slice";
import { IConfig, IFiles } from "@/types";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDispatch, useSelector } from "react-redux";

export function Providers({
  children,
  files,
  config,
  repoName,
  userName,
  token,
  branch,
}: {
  children: React.ReactNode;
  files: IFiles[];
  config: IConfig;
  repoName: string;
  userName: string;
  branch: string;
  token: string;
}) {
  const params = useParams() as { projectId: string; orgId: string };
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(
      updateConfig({
        userName,
        token,
        repo: repoName,
        arrangement: config.arrangement,
        branch,
        media: {
          root: config.media.root,
          public: config.media.public,
        },
        content: {
          root: config.content.root,
        },
        environment: config.environment,
        isRawMode: false,
        themeConfig: config.themeConfig,
        showCommitModal: config.showCommitModal || false,
      }),
    );
  }, []);

  const { userName: isUserReady } = useSelector(selectConfig);
  if (!isUserReady) return null;

  return <DndProvider backend={HTML5Backend}>{children}</DndProvider>;
}
