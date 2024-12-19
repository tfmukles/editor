/* eslint-disable react-hooks/rules-of-hooks */

'use client';
import { use } from 'react';
import { useSelector } from 'react-redux';

import { cn } from '@udecode/cn';
import { Loader2 } from 'lucide-react';
import micromatch from 'micromatch';
import dynamic from 'next/dynamic';
import path from 'path';

import Search from '@/components/Search';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { SelectItem } from '@/components/ui/select';
import config from '@/config/config.json';
import { SCHEMA_FOLDER } from '@/lib/constant';
import { findFileByPath, mergePatterns } from '@/lib/utils/common';
import { extractFolderName } from '@/lib/utils/generateSchema';
import { slugify } from '@/lib/utils/textConverter';
import { selectConfig } from '@/redux/features/config/slice';
import { useGetTreesQuery } from '@/redux/features/git/contentApi';
import { IFiles } from '@/types';

import CreateNewFile from './_components/create-new-file';
import CreateSchema from './_components/create-schema';
import FileRow from './_components/file-row';
import Loading from './loading';

const LIMIT = config.pagination.limit;

type Props = {
  params: Promise<{
    branch: string;
    file: string[];
    orgId: string;
    projectId: string;
    repo: string;
    user: string;
  }>;
  searchParams: Promise<{ group: string; page: number; q: string }>;
};

const DynamicSingle = dynamic(() => import('./_components/single-page'), {
  loading: () => {
    return (
      <div className="text-center w-full h-screen flex">
        <Loader2 className="m-auto animate-spin size-7" />
      </div>
    );
  },
});

export default function Page(props: Props) {
  const searchParams = use(props.searchParams);
  const params = use(props.params);
  const { ext: extension, name } = path.parse(params.file.join('/'));

  if (extension) {
    return <DynamicSingle />;
  }

  const config = useSelector(selectConfig);
  const { data, isLoading: isFilesLoading } = useGetTreesQuery({
    owner: config.userName,
    recursive: '1',
    repo: config.repo,
    tree_sha: config.branch,
  });

  const files = data?.trees || [];

  if (isFilesLoading && !files && !files?.[0]) {
    return <Loading />;
  }

  const arrangements = config.arrangement ?? [];
  const matchedArrangement = arrangements.find(
    (arrangement) =>
      slugify(arrangement.groupName) === slugify(name) &&
      arrangement.type === 'folder'
  );

  const include =
    matchedArrangement?.type === 'folder'
      ? matchedArrangement?.include
      : undefined;
  const exclude =
    matchedArrangement?.type === 'folder'
      ? (matchedArrangement?.exclude ?? [])
      : undefined;

  const { excludes, includes, patterns } = mergePatterns({
    exclude,
    include,
  });

  const realDirectory = `files/${matchedArrangement?.targetPath || params.file.join('/')}`;
  const currentPage = +searchParams.page || 1;
  const startIndex = (currentPage - 1) * LIMIT;
  const endIndex = startIndex + LIMIT;
  const childrenFile = findFileByPath(
    files?.[0]?.children! || [],
    realDirectory
  );

  let filterResult: IFiles[] | undefined = [];
  let searchResult = childrenFile?.children
    ?.toSorted((a, b) => a.name.localeCompare(b.name))
    .filter((item) => {
      if (patterns?.length && item.isFile) {
        const abc = micromatch.isMatch(item.path, includes, {
          ignore: excludes,
          matchBase: true,
        });
        return abc;
      } else if (item.isFile) {
        return true;
      } else {
        return false;
      }
    });

  filterResult = searchResult;
  if (searchParams.q) {
    searchResult = searchResult?.filter((item) =>
      item.name.toLowerCase().includes(searchParams.q.toLowerCase())
    );
  }

  const totalPage = Math.ceil((searchResult?.length || 0) / LIMIT);
  const lowest = Math.max(currentPage - 1, 1);
  const highest = Math.min(currentPage + 1, totalPage);
  const pathname = `/${params.orgId}/${params.projectId}/files/${params.file.join('/')}`;

  return (
    <>
      {params.file.slice(params.file.length).length > 0 && (
        <h2 className="mb-8 capitalize">
          {params.file.slice(params.file.length)}
        </h2>
      )}

      <div className="flex items-center space-x-5">
        <Search className="flex-1 [&_input]:h-11" />
        <div className="space-x-2">
          <CreateNewFile
            size={'lg'}
            className="px-4"
            folderName={name}
            schemaDir={
              SCHEMA_FOLDER +
              '/' +
              extractFolderName(params.file.join('/')) +
              '.json'
            }
            targetPath={params.orgId + '/' + params.projectId}
          />
          <CreateSchema
            size={'lg'}
            variant={'outline'}
            className="hover:bg-primary hover:text-primary-foreground"
            filePath={params.file.join('/')}
            group={searchParams.group}
            schemaDir={
              SCHEMA_FOLDER +
              '/' +
              extractFolderName(params.file.join('/')) +
              '.json'
            }
          >
            {filterResult?.map((item) => {
              return (
                <SelectItem
                  key={item.path}
                  value={item.path.replace('files/', '')}
                >
                  {item.name}
                </SelectItem>
              );
            })}
          </CreateSchema>
        </div>
      </div>
      <div className="mt-4 flex-1">
        <div
          className={cn(
            'space-y-4',
            !searchResult?.length! && 'h-full max-h-[calc(100%_-_64px)]'
          )}
        >
          <div className="grid border border-accent grid-cols-12 bg-light rounded-lg px-6 2xl:px-8 py-2.5 text-dark font-semibold">
            <div className="col-span-4 flex  text-h6 text-primary">Title</div>
            <div className="col-span-2 text-left text-h6 text-primary">
              Slug
            </div>
            <div className="col-span-4 text-center text-h6 text-primary">
              Last Update
            </div>
            <div className="col-span-1 text-left text-h6 text-primary">
              Status
            </div>
            <div className="col-span-1 text-left text-h6 text-primary"></div>
          </div>

          <div className="border border-border rounded-lg [&>*:not(:last-child)]:border-b h-full">
            {searchResult?.length && searchResult?.length! > 0 ? (
              searchResult
                ?.slice(startIndex, endIndex)
                .map((file) => <FileRow key={file.path} file={file} />)
            ) : (
              <div className="col-span-6 h-full text-center space-y-4 flex flex-col justify-center">
                <img
                  className="mx-auto"
                  alt="empty-folder"
                  height={300}
                  src={'/images/empty-folder.svg'}
                  width={300}
                />
                <h2 className="text-center text-xl">No File Found</h2>
              </div>
            )}
          </div>
        </div>
      </div>
      {totalPage > 1 && (
        <Pagination className="pb-3 pt-8">
          <PaginationContent>
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious
                  href={`${pathname}?page=${currentPage - 1}${searchParams.q ? `&q=${searchParams.q}` : ''}`}
                />
              </PaginationItem>
            )}

            {currentPage > 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {[...Array(totalPage)].map((_, i) => {
              return (
                <PaginationItem
                  key={i}
                  className={
                    lowest <= i + 1 && i + 1 <= highest ? '' : 'hidden'
                  }
                >
                  <PaginationLink
                    href={`${pathname}/?page=${i + 1}${searchParams.q ? `&q=${searchParams.q}` : ''}`}
                    isActive={i + 1 === currentPage}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            {highest < totalPage && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            {currentPage < totalPage && (
              <PaginationItem>
                <PaginationNext
                  href={`${pathname}/?page=${currentPage + 1}${searchParams.q ? `&q=${searchParams.q}` : ''}`}
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </>
  );
}
