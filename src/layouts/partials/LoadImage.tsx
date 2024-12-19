'use client';

import { useRef } from 'react';
import { useSelector } from 'react-redux';

import { useInView } from '@/hooks/useInView';
import { sanitizedPath } from '@/lib/utils/common';
import { selectConfig } from '@/redux/features/config/slice';
import { useGetImageQuery } from '@/redux/features/git/contentApi';

interface LoadImageProps {
  children: ({
    ref,
    src,
  }: {
    isLoading: boolean;
    ref: any;
    src: string;
  }) => React.ReactNode;
  path: string;
  className?: string;
  lazy?: boolean;
}

const LoadImage = ({ children, lazy, path }: LoadImageProps) => {
  const PLACEHOLDER_IMAGE = '/images/placeholder.png';
  const FALLBACK_IMAGE = '/images/404.jpg';

  const config = useSelector(selectConfig);
  const { branch } = config;
  const container = useRef<HTMLElement>(null);
  const isInView = useInView(container, { once: true });

  const {
    data: image,
    error,
    isLoading,
  } = useGetImageQuery(
    {
      owner: config.userName,
      path: `${sanitizedPath(config.media.public, path.split(config.media.public).pop()!)}`,
      ref: branch,
      repo: config.repo,
    },
    {
      skip: lazy ? !isInView : false,
    }
  );

  let src = '';
  if (isLoading) {
    src = '';
  }

  if (!isLoading && error) {
    src = src ? FALLBACK_IMAGE : PLACEHOLDER_IMAGE;
  }

  if (!isLoading && !error && image) {
    src = image.download_url;
  }

  return children({ isLoading, ref: container, src });
};

export default LoadImage;
