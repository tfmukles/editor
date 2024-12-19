'use client';

import { useSelector } from 'react-redux';

import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import path from 'path';

import { SCHEMA_FOLDER } from '@/lib/constant';
import { convertSchema } from '@/lib/utils/generateSchema';
import { slugify } from '@/lib/utils/textConverter';
import { selectConfig } from '@/redux/features/config/slice';
import { useGetContentQuery } from '@/redux/features/git/contentApi';
import { Arrangement } from '@/types';

import EditorWrapper from './editor-wrapper';

export default function Single() {
  const { file } = useParams() as { file: string[] };
  const config = useSelector(selectConfig);
  const { branch } = config;
  const arrangements = config.arrangement ?? [];
  const filePathString = decodeURIComponent(file.join('/'));
  const groupName = path.basename(path.dirname(filePathString));

  const possibilityTarget = [
    `${filePathString.replace(`/${slugify(groupName)}`, '')}`,
    path.dirname(`${filePathString.replace(`/${slugify(groupName)}`, '')}`),
  ];

  let matchedArrangement: Arrangement | undefined;
  matchedArrangement = arrangements.find(
    (arrangement) =>
      slugify(arrangement.groupName) === groupName &&
      possibilityTarget.includes(arrangement.targetPath)
  );

  const filepath = matchedArrangement?.targetPath
    ? matchedArrangement.type === 'folder'
      ? filePathString.replace(`/${groupName}`, '')
      : `${matchedArrangement?.targetPath}`
    : file.join('/').replace('files/', '');

  const {
    data: response,
    isFetching,
    isSuccess,
  } = useGetContentQuery({
    owner: config.userName,
    parser: true,
    path: filepath,
    ref: branch,
    repo: config.repo,
  });

  const { content, data, fmType } = response || {};

  const {
    data: schema,
    isError: isSchemaError,
    isFetching: isSchemaFetching,
  } = useGetContentQuery({
    owner: config.userName,
    parser: true,
    path: `${SCHEMA_FOLDER}/${groupName}.json`,
    ref: branch,
    repo: config.repo,
  });

  if (isFetching || !isSuccess || isSchemaFetching) {
    return (
      <div className="text-center w-full h-screen flex">
        <Loader2 className="m-auto animate-spin size-7" />
      </div>
    );
  }

  const template = isSchemaError ? convertSchema(data) : schema?.data?.template;

  return (
    <EditorWrapper
      content={content ?? ''}
      data={data}
      filePath={filepath}
      fmType={fmType}
      schema={template}
    />
  );
}
