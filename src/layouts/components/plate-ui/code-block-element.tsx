import React from 'react';

import type * as monaco from 'monaco-editor';

import MonacoEditor, { loader, useMonaco } from '@monaco-editor/react';
import {
  TElement,
  getPointAfter,
  getPointBefore,
  insertNodes,
  isCollapsed,
  isElement,
  setNodes,
} from '@udecode/plate-common';
import {
  ParagraphPlugin,
  PlateEditor,
  findNodePath,
  focusEditor,
} from '@udecode/plate-common/react';
import { useSelected } from 'slate-react';

import { Autocomplete } from '../autocomplete';
import { uuid } from '../helpers';

type Monaco = typeof monaco;

loader.config({
  paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.31.1/min/vs' },
});

let retryCount = 0;
const retryFocus = (ref) => {
  if (ref.current) {
    ref.current.focus();
  } else {
    if (retryCount < 30) {
      setTimeout(() => {
        retryCount = retryCount + 1;
        retryFocus(ref);
      }, 100);
    }
  }
};

export const CodeBlock = ({
  attributes,
  editor,
  element,
  language: restrictLanguage,
  ...props
}: {
  attributes: Record<string, unknown>;
  children: React.ReactNode;
  editor: PlateEditor;
  element: TElement;
  language?: string;
}) => {
  const [navigateAway, setNavigateAway] = React.useState<
    'down' | 'insertNext' | 'remove' | 'up' | null
  >(null);
  const monaco = useMonaco() as Monaco;
  const monacoEditorRef =
    React.useRef<monaco.editor.IStandaloneCodeEditor>(null);
  const selected = useSelected();
  const [height, setHeight] = React.useState(28);

  React.useEffect(() => {
    if (selected && isCollapsed(editor.selection)) {
      retryFocus(monacoEditorRef);
    }
  }, [selected, monacoEditorRef.current]);

  const value = element.value || '';
  if (typeof value !== 'string') {
    throw new Error(`Element must be of type string for code block`);
  }

  const language = restrictLanguage || element.lang;
  const id = React.useMemo(() => uuid(), []);
  const languages = React.useMemo(() => {
    const defaultLangSet = { '': 'plain text' };
    if (!monaco) return defaultLangSet;
    return monaco.languages.getLanguages().reduce((ac, cv) => {
      if (cv.id === 'plaintext') return ac;
      return { ...ac, [cv.id]: cv.id };
    }, defaultLangSet);
  }, [monaco]);

  React.useEffect(() => {
    if (monaco) {
      monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        // disable errors
        noSemanticValidation: true,
        noSyntaxValidation: true,
      });
    }
  }, [monaco]);

  const items = Object.entries(languages).map(([key, label]) => ({
    key,
    label,
    render: (item: { label: string }) => item.label,
  }));

  const currentItem = React.useMemo(() => {
    return (
      items.find((item) => item.key === language) ?? {
        key: '',
        label: 'Plain Text',
      }
    );
  }, [items, language]);

  React.useEffect(() => {
    if (navigateAway) {
      setNavigateAway(null);
      switch (navigateAway) {
        case 'down': {
          const path = findNodePath(editor, element);
          if (!path) {
            return; // Not sure if/when this would happen
          }

          const nextNodePath = getPointAfter(editor, path);
          if (!nextNodePath) {
            // No next children, insert an empty block
            insertNodes(
              editor,
              [
                {
                  children: [{ text: '' }],
                  lang: undefined,
                  type: ParagraphPlugin.key,
                  value: undefined,
                },
              ],
              { select: true }
            );
            focusEditor(editor);
          } else {
            focusEditor(editor, nextNodePath);
          }
          break;
        }
        case 'insertNext':
          {
            insertNodes(
              editor,
              [
                {
                  children: [{ text: '' }],
                  lang: undefined,
                  type: ParagraphPlugin.key,
                  value: undefined,
                },
              ],
              { select: true }
            );
            focusEditor(editor);
          }
          break;
        case 'remove':
          {
            focusEditor(editor);
            setNodes(
              editor,
              {
                children: [{ text: '' }],
                lang: undefined,
                type: 'p',
                value: undefined,
              },
              {
                match: (n) => {
                  if (isElement(n) && n.type === element.type) {
                    return true;
                  }
                },
              }
            );
          }
          break;
        case 'up':
          {
            const path = findNodePath(editor, element);
            if (!path) {
              return; // Not sure if/when this would happen
            }
            const previousNodePath = getPointBefore(editor, path);
            if (!previousNodePath) {
              focusEditor(editor);
              insertNodes(
                editor,
                [
                  {
                    children: [{ text: '' }],
                    lang: undefined,
                    type: ParagraphPlugin.key,
                    value: undefined,
                  },
                ],
                // Insert a new node at the current path, resulting in the code_block
                // moving down one block
                { at: path, select: true }
              );
              return;
            }

            focusEditor(editor, previousNodePath);
          }
          break;
      }
    }
  }, [navigateAway]);

  function handleEditorDidMount(
    monacoEditor: monaco.editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) {
    monacoEditorRef.current = monacoEditor;
    monacoEditor.onDidContentSizeChange(() => {
      setHeight(monacoEditor.getContentHeight());
      monacoEditor.layout();
    });

    monacoEditor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
      if (monacoEditor.hasTextFocus()) {
        setNavigateAway('insertNext');
      }
    });
    monacoEditor.onKeyDown((l) => {
      if (l.code === 'ArrowUp') {
        const selection = monacoEditor.getSelection();
        if (selection.endLineNumber === 1 && selection.startLineNumber === 1) {
          setNavigateAway('up');
        }
      }
      if (l.code === 'ArrowDown') {
        const selection = monacoEditor.getSelection();
        const totalLines = monacoEditor.getModel().getLineCount();
        if (
          selection.endLineNumber === totalLines &&
          selection.startLineNumber === totalLines
        ) {
          setNavigateAway('down');
        }
      }
      if (l.code === 'Backspace') {
        const selection = monacoEditor.getSelection();
        if (
          selection.endColumn === 1 &&
          selection.endLineNumber === 1 &&
          selection.positionColumn === 1 &&
          selection.positionLineNumber === 1 &&
          selection.selectionStartColumn === 1 &&
          selection.selectionStartLineNumber === 1 &&
          selection.startColumn === 1 &&
          selection.startLineNumber === 1
        ) {
          setNavigateAway('remove');
        }
      }
    });
  }

  return (
    <div
      {...attributes}
      className="relative mb-2 mt-0.5 rounded-lg shadow-md p-2 border-gray-200 border"
    >
      <style>
        {/* Disable hints (not ideal but it conflicts with the toolbar and other floating elements) */}
        {`.monaco-editor .editor-widget {
          display: none !important;
          visibility: hidden !important;
        }`}
      </style>
      {props.children}
      <div contentEditable={false}>
        {!restrictLanguage && (
          <div className="flex justify-between pb-2">
            <div />
            <Autocomplete
              value={currentItem}
              onChange={(item) => setNodes(editor, { lang: item.key })}
              defaultQuery={'plaintext'}
              items={items}
            />
          </div>
        )}
        <div style={{ height: `${height}px` }}>
          <MonacoEditor
            value={String(element.value)}
            onChange={(value) => {
              // FIXME: if a void is focused first, onChange doesn't fire until
              // https://github.com/udecode/plate/issues/1519#issuecomment-1184933602
              setNodes(editor, { lang: language, value });
            }}
            onMount={handleEditorDidMount}
            language={String(language)}
            // Setting a custom theme is kind of buggy because it doesn't get defined until monaco has mounted.
            // So we end up with the default (light) theme in some scenarios. Seems like a race condition.
            // theme="vs-dark"
            options={{
              accessibilitySupport: 'off',
              codeLens: false,
              disableLayerHinting: true,
              fixedOverflowWidgets: true,
              // Takes too much horizontal space for iframe
              folding: false,
              fontSize: 14,
              formatOnPaste: true,
              formatOnType: true,
              lineHeight: 2,
              lineNumbers: 'off',
              minimap: {
                enabled: false,
              },
              renderLineHighlight: 'none',
              scrollBeyondLastLine: false,
              scrollbar: {
                alwaysConsumeMouseWheel: false,
                horizontalScrollbarSize: 1,
                verticalScrollbarSize: 1,
              },
              tabSize: 2,
              wordWrap: 'on',
            }}
            path={id}
          />
        </div>
      </div>
    </div>
  );
};
