'use client';

import { withRef } from '@udecode/cn';
import { insertNodes } from '@udecode/plate-common';
import {
  ParagraphPlugin,
  useEditorRef,
  useHotkeys,
  withHOC,
} from '@udecode/plate-common/react';
import { useDraggable, useDraggableState } from '@udecode/plate-dnd';
import { ImagePlugin, useMediaState } from '@udecode/plate-media/react';
import { ResizableProvider, useResizableStore } from '@udecode/plate-resizable';
import { Trash } from 'lucide-react';
import { ReactEditor } from 'slate-react';

import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import LoadImage from '@/layouts/partials/LoadImage';
import { cn } from '@/lib/utils';

import BlurImage from '../BlurImage';
import ImagesList from '../ImageList';
import { PlateElement } from './plate-element';

export const ImageElement = withHOC(
  ResizableProvider,
  withRef<typeof PlateElement>(
    ({ children, className, nodeProps, ...props }, ref) => {
      const editor = useEditorRef();
      const element = props.element;
      useHotkeys('enter', () => {
        insertNodes(editor, [
          { children: [{ text: '' }], type: ParagraphPlugin.key },
        ]);
      });

      const path = ReactEditor.findPath(editor, element);
      const { align = 'center', focused, readOnly, selected } = useMediaState();

      const width = useResizableStore().get.width();

      const state = editor.plugins.dnd
        ? useDraggableState({ element: props.element })
        : ({} as any);

      const { isDragging } = state;
      const { handleRef } = useDraggable(state);

      return (
        <PlateElement ref={ref} className={cn('py-2.5', className)} {...props}>
          <div
            ref={handleRef}
            className={cn(
              'block w-full cursor-pointer object-cover px-0',
              'rounded-sm max-w-sm',
              focused && selected && 'ring-2 ring-ring ring-offset-2',
              isDragging && 'opacity-50'
            )}
            {...nodeProps}
          >
            <AspectRatio
              className="group bg-stripes-gray rounded-lg w-full relative flex items-center justify-center"
              contentEditable={false}
              ratio={16 / 9}
            >
              <LoadImage path={element.url as string}>
                {({ src }) => (
                  <BlurImage
                    className="m-auto max-w-full max-h-full size-auto"
                    alt="img"
                    src={src}
                  />
                )}
              </LoadImage>
              <div className="box-content flex h-9 items-center gap-1">
                <Button
                  variant="ghost"
                  className="absolute top-4 right-4 z-50  group-hover:flex"
                  onClick={() => {
                    editor.removeNodes({ at: path, mode: 'highest' });
                  }}
                  type="button"
                >
                  <Trash className="size-4" />
                </Button>
              </div>

              <ImagesList
                name={''}
                className="cursor-pointer absolute z-30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                onChangeHandler={(e: any) => {
                  const src = e.target.value;
                  editor.setNodes(
                    {
                      // @ts-ignore
                      children: [{ text: '', type: 'text' }],
                      type: ImagePlugin.key,
                      url: src,
                    },
                    {
                      at: path,
                    }
                  );
                }}
                path={''}
              />
            </AspectRatio>
          </div>
        </PlateElement>
      );
    }
  )
);
