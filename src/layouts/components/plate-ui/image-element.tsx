'use client';

import { cn, withRef } from '@udecode/cn';
import { setNode, useEditorRef, withHOC } from '@udecode/plate-common/react';
import { useDraggable, useDraggableState } from '@udecode/plate-dnd';
import { useMediaState } from '@udecode/plate-media/react';
import { ResizableProvider, useResizableStore } from '@udecode/plate-resizable';
import { Trash } from 'lucide-react';
import { ReactEditor } from 'slate-react';

import LoadImage from '@/layouts/partials/LoadImage';

import BlurImage from '../BlurImage';
import ImagesList from '../ImageList';
import { AspectRatio } from '../ui/aspect-ratio';
import { Button } from '../ui/button';
import { PlateElement } from './plate-element';

export const ImageElement = withHOC(
  ResizableProvider,
  withRef<typeof PlateElement>(
    ({ children, className, nodeProps, ...props }, ref) => {
      const editor = useEditorRef();
      const { focused, selected } = useMediaState();
      const width = useResizableStore().get.width();

      const state = editor.plugins.dnd
        ? useDraggableState({ element: props.element })
        : ({} as any);

      const { isDragging } = state;
      const { handleRef } = useDraggable(state);

      return (
        <PlateElement ref={ref} className={cn('py-2.5', className)} {...props}>
          <figure className="group relative m-0" contentEditable={false}>
            <div
              ref={handleRef}
              className={cn(
                'block w-full max-w-sm cursor-pointer object-cover px-0',
                'rounded-sm',
                focused && selected && 'ring-2 ring-ring ring-offset-2',
                isDragging && 'opacity-50'
              )}
            >
              <AspectRatio
                className="group bg-stripes-gray rounded-lg w-full relative flex items-center justify-center"
                contentEditable={false}
                ratio={16 / 9}
              >
                <LoadImage path={props.element.url as string}>
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
                      const path = ReactEditor.findPath(editor, props.element);
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
                    setNode(editor, props.element, { url: src });
                  }}
                  path={''}
                />
              </AspectRatio>
            </div>
          </figure>

          {children}
        </PlateElement>
      );
    }
  )
);
