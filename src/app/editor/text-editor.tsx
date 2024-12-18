'use client';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { Plate } from '@udecode/plate-common/react';

import { SettingsDialog } from '@/components/editor/settings';
import { useCreateEditor } from '@/components/editor/use-create-editor';
import { Editor, EditorContainer } from '@/components/plate-ui/editor';
import { TElement } from '@udecode/plate-common';
import { useMemo } from 'react';
import { helpers } from './_components/helpers';

export default function TextEditor(props: {
  input: {
    value: TElement;
    onChange: (value: TElement) => void;
  };
}) {
  const initialValue = useMemo(
    () =>
      props.input.value?.children?.length
        ? props.input.value.children.map(helpers.normalize)
        : [{ type: 'p', children: [{ type: 'text', text: '' }] }],
    []
  );
  const editor = useCreateEditor({ value: initialValue });

  return (
    <DndProvider backend={HTML5Backend}>
      <Plate
        onValueChange={(v) => {
          props.input.onChange({
            type: 'root',
            children: v.value,
          });
        }}
        editor={editor}
      >
        <EditorContainer>
          <Editor variant="aiChat" />
        </EditorContainer>
        <SettingsDialog />
      </Plate>
    </DndProvider>
  );
}
