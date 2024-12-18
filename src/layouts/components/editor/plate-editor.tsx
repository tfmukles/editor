'use client';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { Plate } from '@udecode/plate-common/react';

import { SettingsDialog } from '@/layouts/components/editor/settings';
import { useCreateEditor } from '@/layouts/components/editor/use-create-editor';
import { Editor, EditorContainer } from '@/layouts/components/plate-ui/editor';

export function PlateEditor() {
  const editor = useCreateEditor();

  return (
    <DndProvider backend={HTML5Backend}>
      <Plate
        onValueChange={(v) => {
          console.log(v.value);
        }}
        editor={editor}
      >
        <EditorContainer>
          <Editor variant="demo" />
        </EditorContainer>
        <SettingsDialog />
      </Plate>
    </DndProvider>
  );
}
