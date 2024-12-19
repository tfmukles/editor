import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/use-debounce';
import { setRawMode } from '@/redux/features/config/slice';
import { useAppDispatch } from '@/redux/store';
import MonacoEditor, { loader, useMonaco } from '@monaco-editor/react';
import { parseMDX, stringifyMDX } from '@tinacms/mdx';
import type * as monaco from 'monaco-editor';
import React from 'react';
import { RichTextType } from 'tinacms';
import {
  ErrorMessage,
  InvalidMarkdownElement,
  buildError,
} from './error-message';

export const uuid = () => {
  // @ts-ignore
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
};

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

export const RawEditor = (props: RichTextType) => {
  const monaco = useMonaco() as Monaco;
  const monacoEditorRef =
    React.useRef<monaco.editor.IStandaloneCodeEditor>(null);
  const [height, setHeight] = React.useState(100);
  const id = React.useMemo(() => uuid(), []);
  const field = {
    label: 'rich text',
    name: 'templates',
    type: 'rich-text',
    templates: [],
  };

  const inputValue = React.useMemo(() => {
    // @ts-ignore no access to the rich-text type from this package
    const res = stringifyMDX(props.input.value, field, (value) => value);
    return typeof props.input.value === 'string' ? props.input.value : res;
  }, []);

  const [value, setValue] = React.useState(inputValue);
  const [error, setError] = React.useState<InvalidMarkdownElement>(null);
  const debouncedValue = useDebounce(value, 500);

  React.useEffect(() => {
    // @ts-ignore no access to the rich-text type from this package
    const parsedValue = parseMDX(value, field, (value) => value);
    if (
      parsedValue.children[0] &&
      parsedValue.children[0].type === 'invalid_markdown'
    ) {
      const invalidMarkdown = parsedValue.children[0];
      setError(invalidMarkdown);
    } else {
      setError(null);
    }

    props.input.onChange(parsedValue);
  }, [JSON.stringify(debouncedValue)]);

  React.useEffect(() => {
    if (monacoEditorRef.current) {
      if (error) {
        const errorMessage = buildError(error);
        monaco.editor.setModelMarkers(monacoEditorRef.current.getModel(), id, [
          {
            ...errorMessage.position,
            message: errorMessage.message,
            severity: 8,
          },
        ]);
      } else {
        monaco.editor.setModelMarkers(
          monacoEditorRef.current.getModel(),
          id,
          []
        );
      }
    }
  }, [JSON.stringify(error), monacoEditorRef.current]);

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

  function handleEditorDidMount(
    monacoEditor: monaco.editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) {
    monacoEditorRef.current = monacoEditor;
    monacoEditor.onDidContentSizeChange(() => {
      // FIXME: if the window is too tall the performance degrades, come up with a nice
      // balance between the two
      setHeight(Math.min(Math.max(100, monacoEditor.getContentHeight()), 1000));
      monacoEditor.layout();
    });
  }

  const dispatch = useAppDispatch();

  return (
    <div className="relative">
      <div className="sticky top-[68px] w-full flex justify-between mb-2 z-50 max-w-full">
        <Button
          onClick={() => dispatch(setRawMode(false))}
          className="max-w-[280px]"
        >
          View in rich-text editor 📝
        </Button>
        <ErrorMessage error={error} />
      </div>
      <div style={{ height: `${height}px` }}>
        <MonacoEditor
          path={id}
          onMount={handleEditorDidMount}
          options={{
            scrollBeyondLastLine: false,
            tabSize: 2,
            disableLayerHinting: true,
            accessibilitySupport: 'off',
            codeLens: false,
            wordWrap: 'on',
            minimap: {
              enabled: false,
            },
            fontSize: 14,
            lineHeight: 2,
            formatOnPaste: true,
            lineNumbers: 'off',
            lineNumbersMinChars: 2,
            formatOnType: true,
            fixedOverflowWidgets: true,
            folding: false,
            renderLineHighlight: 'none',
            scrollbar: {
              verticalScrollbarSize: 4,
              horizontalScrollbarSize: 4,

              alwaysConsumeMouseWheel: false,
            },
          }}
          language={'markdown'}
          value={value}
          onChange={(value) => {
            try {
              setValue(value);
            } catch (e) {}
          }}
        />
      </div>
    </div>
  );
};

export default RawEditor;
