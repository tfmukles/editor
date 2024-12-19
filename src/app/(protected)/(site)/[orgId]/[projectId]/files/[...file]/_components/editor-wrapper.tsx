'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import toml from '@iarna/toml';
import { parseMDX, stringifyMDX } from '@tinacms/mdx';
import { cn } from '@udecode/cn';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import path from 'path';

import TextEditor from '@/app/editor/text-editor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { State } from '@/lib/context/type';
import { contentFormatter, format } from '@/lib/utils/contentFormatter';
import { selectConfig } from '@/redux/features/config/slice';
import { useUpdateFilesMutation } from '@/redux/features/git/commitApi';
import {
  contentApi,
  useGetDeployStatusQuery,
} from '@/redux/features/git/contentApi';
import { githubApi } from '@/redux/features/git/gitApi';
import { useAppDispatch } from '@/redux/store';

import PreviewData from './preview-data';

interface CommitDetails {
  createPullRequest: boolean;
  description: string;
  message: string;
}

interface CommitModalProps {
  branch: string;
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onCommit: (details: CommitDetails) => void;
}

type Field = {
  type:
    | 'Array'
    | 'Date'
    | 'boolean'
    | 'gallery'
    | 'media'
    | 'number'
    | 'object'
    | 'string';
  label: string;
  name: string;
  value: string;
  description?: string;
  fields?: Field[];
  isIgnored?: boolean;
  isRequired?: boolean;
};

interface EditorWrapperProps {
  content: string;
  data: Record<string, any>;
  filePath: string;
  fmType: format;
  schema: Field[];
  shouldShowEditor?: boolean;
}

interface CommitData {
  content: string;
  path: string;
}

// CommitModal Component
const CommitModal: React.FC<CommitModalProps> = ({
  branch,
  isLoading,
  isOpen,
  onClose,
  onCommit,
}) => {
  const [message, setMessage] = useState('');
  const [description, setDescription] = useState('');
  const [commitType] = useState<'main' | 'pr'>('main');

  const handleCommit = () => {
    onCommit({
      createPullRequest: commitType === 'pr',
      description,
      message,
    });
  };

  useEffect(() => {
    if (!isLoading) {
      onClose();
      setMessage('');
      setDescription('');
    }
  }, [isLoading]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] gap-5">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Commit changes
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="commit-message">
              Commit message
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="commit-message"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter a descriptive commit message"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="extended-description">Extended description</Label>
            <Textarea
              id="extended-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add an optional extended description.."
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-end">
          <Button size="lg" variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            size="lg"
            disabled={isLoading || !message.trim()}
            onClick={handleCommit}
            type="button"
          >
            {isLoading ? (
              <>
                Committing
                <Loader2 className="size-5 animate-spin ml-2" />
              </>
            ) : (
              'Commit changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// EditorWrapper Component
const EditorWrapper: React.FC<EditorWrapperProps> = ({
  content,
  data,
  filePath,
  fmType,
  schema,
  shouldShowEditor = true,
}) => {
  const config = useSelector(selectConfig);
  const { branch, isRawMode, showCommitModal: shouldCommitManual } = config;
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isDraft, setIsDraft] = useState(data.draft);
  const [showCommitModal, setShowCommitModal] = useState(false);
  const [commitData, setCommitData] = useState<CommitData | null>(null);

  if (typeof window !== 'undefined') {
    document.querySelector('#main')?.classList.add('2xl:!px-0', '2xl:!py-0');
  }

  useEffect(() => {
    return () => {
      document
        .querySelector('#main')
        ?.classList.remove('2xl:!px-0', '2xl:!py-0');
    };
  }, []);

  const [updateFile, { isLoading: pending, isSuccess }] =
    useUpdateFilesMutation();
  const storeRef = useRef<State | undefined>({
    data: JSON.parse(JSON.stringify(data)),
    images: [],
    page_content: content ?? '',
  });

  const [state, setState] = useState<State | undefined>({
    data,
    images: [],
    page_content: content ?? '',
  });

  const initialValue = useMemo(() => {
    return parseMDX(
      content,
      {
        label: 'rich text',
        name: 'templates',
        templates: [],
        type: 'rich-text',
      },
      (url: string) => url
    );
  }, [JSON.stringify(storeRef.current)]);

  const [key, setKey] = useState(false);
  const [value, setValue] = useState(initialValue);
  const debouncedValue = useDebounce(value, 500);

  useEffect(() => {
    const mdxValue = stringifyMDX(
      value,
      {
        label: 'rich text',
        name: 'templates',
        templates: [],
        type: 'rich-text',
      },
      (url: string) => url
    );
    // @ts-ignore
    setState((prev) => ({ ...prev, page_content: mdxValue }));

    if (storeRef.current?.page_content.includes('\n')) {
      storeRef.current = {
        ...storeRef.current,
        page_content: mdxValue!,
      };
    }
  }, [JSON.stringify(debouncedValue)]);

  const prepareCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    const draft = schema.find((item) => item.name === 'draft');
    const filetype = path.parse(filePath).ext.replace('.', '');
    const isTomlFile = filetype === '';

    const data: CommitData = {
      content: isTomlFile
        ? toml.stringify(
            shouldShowEditor && draft?.type === 'boolean'
              ? { ...state?.data!, draft: isDraft }
              : state?.data!
          )
        : contentFormatter({
            data:
              shouldShowEditor && draft?.type === 'boolean'
                ? { ...state?.data!, draft: isDraft }
                : state?.data!,
            format: fmType,
            page_content: state?.page_content!,
          }),
      path: filePath,
    };

    if (shouldCommitManual) {
      setCommitData(data);
      setShowCommitModal(true);
    } else {
      updateFile({
        files: [
          {
            content: data.content,
            path: data.path,
          },
        ],
        message: 'Update file',
        owner: config.userName,
        repo: config.repo,
        tree: config.branch,
      }).then((res) => {
        if (!res.error?.message) {
          storeRef.current = state;
          dispatch(
            contentApi.util.updateQueryData(
              'getContent',
              {
                owner: config.userName,
                parser: true,
                path: filePath,
                ref: config.branch,
                repo: config.repo,
              },
              (draft) => {
                draft.data = { ...state?.data!, draft: isDraft };
                draft.content = state?.page_content;
                return draft;
              }
            )
          );
          dispatch(
            githubApi.util.invalidateTags([{ id: filePath, type: 'commit' }])
          );
          toast({
            title: 'File updated successfully',
          });
          setShowCommitModal(false);
        }
      });
    }
  };

  const handleCommit = async (commitDetails: CommitDetails) => {
    if (!commitData) return;
    await updateFile({
      description: commitDetails.description,
      files: [
        {
          content: commitData.content,
          path: commitData.path,
        },
      ],
      message: commitDetails.message,
      owner: config.userName,
      repo: config.repo,
      tree: config.branch,
    }).then((res) => {
      if (!res.error?.message) {
        storeRef.current = state;
        dispatch(
          contentApi.util.updateQueryData(
            'getContent',
            {
              owner: config.userName,
              parser: true,
              path: filePath,
              ref: config.branch,
              repo: config.repo,
            },
            (draft) => {
              draft.data = { ...state?.data!, draft: isDraft };
              draft.content = state?.page_content;
              return draft;
            }
          )
        );
        dispatch(
          githubApi.util.invalidateTags([{ id: filePath, type: 'commit' }])
        );
        toast({
          title: 'File updated successfully',
        });
        setShowCommitModal(false);
      }
    });
  };

  const onReset = () => {
    setValue(initialValue);
    setState(JSON.parse(JSON.stringify(storeRef.current)));
    setKey((k) => !k);
  };

  const isChanged = useMemo(() => {
    return (
      JSON.stringify(state) !== JSON.stringify(storeRef.current) ||
      JSON.stringify(value) !== JSON.stringify(initialValue)
    );
  }, [
    JSON.stringify(state),
    JSON.stringify(storeRef.current),
    JSON.stringify(value),
  ]);

  const { data: status } = useGetDeployStatusQuery({
    owner: config.userName,
    ref: config.branch,
    repo: config.repo,
  });

  const conclusion = status?.check_runs[0]?.conclusion;

  return (
    <>
      <form
        ref={formRef}
        className={cn(
          'p-8 lg:pt-0 xl:pt-8',
          !shouldShowEditor && '2xl:px-14 px-5 pt-0'
        )}
        onSubmit={prepareCommit}
      >
        <div
          className={cn(
            'py-2 bg-background sticky -top-8 2xl:top-0 left-0 mb-5 bg flex justify-between w-full z-50',
            !shouldShowEditor && 'mt-0'
          )}
        >
          <Button
            size="lg"
            variant="basic"
            className="space-x-3 p-0"
            onClick={() => router.back()}
            type="button"
          >
            <ArrowLeft className="size-6" />
            <span>Back</span>
          </Button>
          <div className="flex items-center space-x-4">
            {status?.total_count! > 0 && (
              <Badge
                variant={'secondary'}
                className="capitalize h-auto p-2 px-4"
              >
                <span
                  className={cn(
                    'size-2 rounded-full mr-1.5',
                    conclusion === 'success' && 'bg-success',
                    conclusion === 'failure' && 'bg-destructive'
                  )}
                />
                {conclusion === 'success' ? 'Build Success' : 'Build Failed'}
              </Badge>
            )}
            <Button
              size="lg"
              variant="outline"
              className="w-40"
              disabled={!isChanged}
              onClick={onReset}
              type="button"
            >
              Reset
            </Button>
            {shouldShowEditor && (
              <Button
                size="lg"
                disabled={isDraft || pending}
                onClick={() => {
                  setIsDraft(true);
                  formRef?.current?.requestSubmit();
                }}
                type="button"
              >
                Save as Draft
                {pending && isDraft && (
                  <Loader2 className="ml-2 size-4 animate-spin" />
                )}
              </Button>
            )}
            <Button
              size="lg"
              className="w-40"
              disabled={!isChanged || pending}
              onClick={() => setIsDraft(false)}
              type="submit"
            >
              {isDraft ? 'Save' : shouldShowEditor ? 'Publish' : 'Save'}
              {pending && !isDraft && (
                <Loader2 className="ml-2 size-4 animate-spin" />
              )}
            </Button>
          </div>
        </div>

        <PreviewData data={state?.data!} schema={schema} setData={setState} />
        {shouldShowEditor && (
          <>
            <Label className="mt-4">Body</Label>
            <div className="border border-border">
              {!isRawMode ? (
                <TextEditor
                  key={key ? '1' : '2'}
                  input={{
                    value: value,
                    onChange: (v) => {
                      setValue(v);
                    },
                  }}
                />
              ) : (
                <></>
              )}
            </div>
          </>
        )}
      </form>

      <CommitModal
        onClose={() => setShowCommitModal(false)}
        onCommit={handleCommit}
        branch={branch}
        isLoading={pending}
        isOpen={showCommitModal}
      />
    </>
  );
};

export default EditorWrapper;
