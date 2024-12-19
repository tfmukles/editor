'use client';

import { useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { TElement } from '@udecode/plate-common';
import { ParagraphPlugin, Plate } from '@udecode/plate-common/react';

import { SettingsDialog } from '@/components/editor/settings';
import { useCreateEditor } from '@/components/editor/use-create-editor';
import { Editor, EditorContainer } from '@/components/plate-ui/editor';

import { helpers } from './helpers';

export default function TextEditor(props: {
  input: {
    value: TElement;
    onChange: (value: TElement) => void;
  };
}) {
  const initialValue = useMemo(
    () =>
      props.input.value.children.length > 0
        ? props.input.value.children?.map(helpers.normalize)
        : [
            {
              children: [{ text: '', type: 'text' }],
              type: ParagraphPlugin.key,
            },
          ],
    []
  );

  console.log({ initialValue });

  const editor = useCreateEditor({ value: initialValue });

  return (
    <DndProvider backend={HTML5Backend}>
      <Plate onValueChange={({ value }) => {}} editor={editor}>
        <EditorContainer>
          <Editor variant="fullWidth" />
        </EditorContainer>
        <SettingsDialog />
      </Plate>
    </DndProvider>
  );
}
