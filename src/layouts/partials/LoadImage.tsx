"use client";

import { useInView } from "@/hooks/useInView";
import { sanitizedPath } from "@/lib/utils/common";
import { selectConfig } from "@/redux/features/config/slice";
import { useGetImageQuery } from "@/redux/features/git/contentApi";
import { useRef } from "react";
import { useSelector } from "react-redux";

interface LoadImageProps {
  path: string;
  className?: string;
  children: ({
    src,
    ref,
  }: {
    src: string;
    ref: any;
    isLoading: boolean;
  }) => React.ReactNode;
  lazy?: boolean;
}

const LoadImage = ({ path, children, lazy }: LoadImageProps) => {
  const PLACEHOLDER_IMAGE = "/images/placeholder.png";
  const FALLBACK_IMAGE = "/images/404.jpg";

  const config = useSelector(selectConfig);
  const { branch } = config;
  const container = useRef<HTMLElement>(null);
  const isInView = useInView(container, { once: true });

  const {
    data: image,
    isLoading,
    error,
  } = useGetImageQuery(
    {
      ref: branch,
      owner: config.userName,
      repo: config.repo,
      path: `${sanitizedPath(config.media.public, path.split(config.media.public).pop()!)}`,
    },
    {
      skip: lazy ? !isInView : false,
    },
  );

  let src = "";
  if (isLoading) {
    src = "";
  }

  if (!isLoading && error) {
    src = src ? FALLBACK_IMAGE : PLACEHOLDER_IMAGE;
  }

  if (!isLoading && !error && image) {
    src = image.download_url;
  }

  return children({ src, ref: container, isLoading });
};

export default LoadImage;
