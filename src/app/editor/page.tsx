'use client';

import { selectConfig } from '@/redux/features/config/slice';
import { parseMDX } from '@tinacms/mdx';
import { TElement } from '@udecode/plate-common';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import RawEditor from './raw-editor';
import TextEditor from './text-editor';

export default function Editor({}) {
  const config = useSelector(selectConfig);
  const { isRawMode } = config;
  const content = `
    # Hello World
  `;

  const initialValue = useMemo(() => {
    return parseMDX(
      content,
      {
        label: 'rich text',
        name: 'templates',
        type: 'rich-text',
        templates: [],
      },
      (url: string) => url
    );
  }, []);
  const [value, setValue] = useState<TElement>({ type: 'root', children: [] });

  return !isRawMode ? (
    <TextEditor
      input={{
        value: initialValue,
        onChange: (value) => setValue(value),
      }}
    />
  ) : (
    <RawEditor />
  );
}
