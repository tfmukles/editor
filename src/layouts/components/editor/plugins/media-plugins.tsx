'use client';

import { CaptionPlugin } from '@udecode/plate-caption/react';
import { ImagePlugin } from '@udecode/plate-media/react';

import { ImagePreview } from '@/layouts/components/plate-ui/image-preview';

export const mediaPlugins = [
  ImagePlugin.extend({
    options: {
      disableUploadInsert: true,
    },
    render: { afterEditable: ImagePreview },
  }),

  CaptionPlugin.configure({
    options: {
      plugins: [ImagePlugin],
    },
  }),
] as const;
