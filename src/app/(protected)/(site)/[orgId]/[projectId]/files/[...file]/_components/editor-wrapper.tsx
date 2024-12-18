"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Editor from "@/editor/editor";
import RawEditor from "@/editor/rich-text";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/useDebounce";
import { State } from "@/lib/context/type";
import { contentFormatter, format } from "@/lib/utils/contentFormatter";
import { selectConfig } from "@/redux/features/config/slice";
import { useUpdateFilesMutation } from "@/redux/features/git/commitApi";
import {
  contentApi,
  useGetDeployStatusQuery,
} from "@/redux/features/git/contentApi";
import { githubApi } from "@/redux/features/git/gitApi";
import { useAppDispatch } from "@/redux/store";
import toml from "@iarna/toml";
import { parseMDX, stringifyMDX } from "@tinacms/mdx";
import { cn } from "@udecode/cn";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import path from "path";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import PreviewData from "./preview-data";

interface CommitDetails {
  message: string;
  description: string;
  createPullRequest: boolean;
}

interface CommitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCommit: (details: CommitDetails) => void;
  isLoading: boolean;
  branch: string;
}

type Field = {
  label: string;
  type:
    | "media"
    | "gallery"
    | "number"
    | "Date"
    | "string"
    | "Array"
    | "object"
    | "boolean";
  name: string;
  value: string;
  fields?: Field[];
  description?: string;
  isIgnored?: boolean;
  isRequired?: boolean;
};

interface EditorWrapperProps {
  data: Record<string, any>;
  content: string;
  schema: Field[];
  filePath: string;
  fmType: format;
  shouldShowEditor?: boolean;
}

interface CommitData {
  path: string;
  content: string;
}

// CommitModal Component
const CommitModal: React.FC<CommitModalProps> = ({
  isOpen,
  onClose,
  onCommit,
  isLoading,
  branch,
}) => {
  const [message, setMessage] = useState("");
  const [description, setDescription] = useState("");
  const [commitType, setCommitType] = useState<"main" | "pr">("main");

  const handleCommit = () => {
    onCommit({
      message,
      description,
      createPullRequest: commitType === "pr",
    });
  };

  useEffect(() => {
    if (!isLoading) {
      onClose();
      setMessage("");
      setDescription("");
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
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter a descriptive commit message"
              required
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
          {/* <RadioGroup
            value={commitType}
            onValueChange={(value: "main" | "pr") => setCommitType(value)}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2 rounded-md">
              <RadioGroupItem value="main" id="main" />
              <Label htmlFor="main" className="flex-1 mb-0">
                <div className="font-medium">
                  Commit directly to the {branch} branch
                </div>
              </Label>
            </div>
            <div className="flex items-start space-x-2 rounded-md">
              <RadioGroupItem value="pr" id="r2" />
              <Label className="flex-1 mb-3" htmlFor="r2">
                <div className="font-medium">
                  Create a new branch for this commit and start a pull request
                </div>
                <span className="text-sm text-muted-foreground">
                  <a
                    href="https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests"
                    className="text-blue-500 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Learn more about pull requests
                  </a>
                </span>
              </Label>
            </div>
          </RadioGroup> */}
        </div>
        <DialogFooter className="sm:justify-end">
          <Button size="lg" type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCommit}
            type="button"
            size="lg"
            disabled={isLoading || !message.trim()}
          >
            {isLoading ? (
              <>
                Committing
                <Loader2 className="size-5 animate-spin ml-2" />
              </>
            ) : (
              "Commit changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// EditorWrapper Component
const EditorWrapper: React.FC<EditorWrapperProps> = ({
  data,
  content,
  schema,
  filePath,
  fmType,
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

  if (typeof window !== "undefined") {
    document.querySelector("#main")?.classList.add("2xl:!px-0", "2xl:!py-0");
  }

  useEffect(() => {
    return () => {
      document
        .querySelector("#main")
        ?.classList.remove("2xl:!px-0", "2xl:!py-0");
    };
  }, []);

  const [updateFile, { isLoading: pending, isSuccess }] =
    useUpdateFilesMutation();
  const storeRef = useRef<State | undefined>({
    data: JSON.parse(JSON.stringify(data)),
    images: [],
    page_content: content ?? "",
  });

  const [state, setState] = useState<State | undefined>({
    data,
    images: [],
    page_content: content ?? "",
  });

  const initialValue = useMemo(() => {
    return parseMDX(
      content,
      {
        label: "rich text",
        name: "templates",
        type: "rich-text",
        templates: [],
      },
      (url: string) => url,
    );
  }, [JSON.stringify(storeRef.current)]);

  const [key, setKey] = useState(false);
  const [value, setValue] = useState(initialValue);
  const debouncedValue = useDebounce(value, 500);

  useEffect(() => {
    const mdxValue = stringifyMDX(
      value,
      {
        label: "rich text",
        name: "templates",
        type: "rich-text",
        templates: [],
      },
      (url: string) => url,
    );
    // @ts-ignore
    setState((prev) => ({ ...prev, page_content: mdxValue }));

    if (storeRef.current?.page_content.includes("\n")) {
      storeRef.current = {
        ...storeRef.current,
        page_content: mdxValue!,
      };
    }
  }, [JSON.stringify(debouncedValue)]);

  const prepareCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    const draft = schema.find((item) => item.name === "draft");
    const filetype = path.parse(filePath).ext.replace(".", "");
    const isTomlFile = filetype === "";

    const data: CommitData = {
      path: filePath,
      content: isTomlFile
        ? toml.stringify(
            shouldShowEditor && draft?.type === "boolean"
              ? { ...state?.data!, draft: isDraft }
              : state?.data!,
          )
        : contentFormatter({
            data:
              shouldShowEditor && draft?.type === "boolean"
                ? { ...state?.data!, draft: isDraft }
                : state?.data!,
            page_content: state?.page_content!,
            format: fmType,
          }),
    };

    if (shouldCommitManual) {
      setCommitData(data);
      setShowCommitModal(true);
    } else {
      updateFile({
        files: [
          {
            path: data.path,
            content: data.content,
          },
        ],
        message: "Update file",
        owner: config.userName,
        repo: config.repo,
        tree: config.branch,
      }).then((res) => {
        if (!res.error?.message) {
          storeRef.current = state;
          dispatch(
            contentApi.util.updateQueryData(
              "getContent",
              {
                path: filePath,
                owner: config.userName,
                repo: config.repo,
                parser: true,
                ref: config.branch,
              },
              (draft) => {
                draft.data = { ...state?.data!, draft: isDraft };
                draft.content = state?.page_content;
                return draft;
              },
            ),
          );
          dispatch(
            githubApi.util.invalidateTags([{ type: "commit", id: filePath }]),
          );
          toast({
            title: "File updated successfully",
          });
          setShowCommitModal(false);
        }
      });
    }
  };

  const handleCommit = async (commitDetails: CommitDetails) => {
    if (!commitData) return;
    await updateFile({
      files: [
        {
          path: commitData.path,
          content: commitData.content,
        },
      ],
      owner: config.userName,
      repo: config.repo,
      tree: config.branch,
      message: commitDetails.message,
      description: commitDetails.description,
    }).then((res) => {
      if (!res.error?.message) {
        storeRef.current = state;
        dispatch(
          contentApi.util.updateQueryData(
            "getContent",
            {
              path: filePath,
              owner: config.userName,
              repo: config.repo,
              parser: true,
              ref: config.branch,
            },
            (draft) => {
              draft.data = { ...state?.data!, draft: isDraft };
              draft.content = state?.page_content;
              return draft;
            },
          ),
        );
        dispatch(
          githubApi.util.invalidateTags([{ type: "commit", id: filePath }]),
        );
        toast({
          title: "File updated successfully",
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
    repo: config.repo,
    ref: config.branch,
  });

  const conclusion = status?.check_runs[0]?.conclusion;

  return (
    <>
      <form
        ref={formRef}
        onSubmit={prepareCommit}
        className={cn(
          "p-8 lg:pt-0 xl:pt-8",
          !shouldShowEditor && "2xl:px-14 px-5 pt-0",
        )}
      >
        <div
          className={cn(
            "py-2 bg-background sticky -top-8 2xl:top-0 left-0 mb-5 bg flex justify-between w-full z-50",
            !shouldShowEditor && "mt-0",
          )}
        >
          <Button
            onClick={() => router.back()}
            size="lg"
            className="space-x-3 p-0"
            variant="basic"
            type="button"
          >
            <ArrowLeft className="size-6" />
            <span>Back</span>
          </Button>
          <div className="flex items-center space-x-4">
            {status?.total_count! > 0 && (
              <Badge
                variant={"secondary"}
                className="capitalize h-auto p-2 px-4"
              >
                <span
                  className={cn(
                    "size-2 rounded-full mr-1.5",
                    conclusion === "success" && "bg-success",
                    conclusion === "failure" && "bg-destructive",
                  )}
                />
                {conclusion === "success" ? "Build Success" : "Build Failed"}
              </Badge>
            )}
            <Button
              size="lg"
              variant="outline"
              className="w-40"
              type="button"
              disabled={!isChanged}
              onClick={onReset}
            >
              Reset
            </Button>
            {shouldShowEditor && (
              <Button
                type="button"
                size="lg"
                disabled={isDraft || pending}
                onClick={() => {
                  setIsDraft(true);
                  formRef?.current?.requestSubmit();
                }}
              >
                Save as Draft
                {pending && isDraft && (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                )}
              </Button>
            )}
            <Button
              type="submit"
              disabled={!isChanged || pending}
              size="lg"
              className="w-40"
              onClick={() => setIsDraft(false)}
            >
              {isDraft ? "Save" : shouldShowEditor ? "Publish" : "Save"}
              {pending && !isDraft && (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              )}
            </Button>
          </div>
        </div>

        <PreviewData schema={schema} data={state?.data!} setData={setState} />
        {shouldShowEditor && (
          <>
            <Label className="mt-4">Body</Label>
            <div className="min-h-[250px] max-w-full content relative w-full border border-border rounded-lg 2xl:p-8 p-4 flex flex-col">
              {!isRawMode ? (
                <Editor
                  key={key ? "1" : "2"}
                  // @ts-ignore
                  input={{
                    value: value,
                    // @ts-ignore
                    onChange: (v) => {
                      setValue(v);
                    },
                  }}
                />
              ) : (
                <RawEditor
                  key={key ? "1" : "2"}
                  // @ts-ignore
                  input={{
                    value: value,
                    onChange: (v) => {
                      setValue(v);
                    },
                  }}
                />
              )}
            </div>
          </>
        )}
      </form>

      <CommitModal
        isOpen={showCommitModal}
        onClose={() => setShowCommitModal(false)}
        onCommit={handleCommit}
        isLoading={pending}
        branch={branch}
      />
    </>
  );
};

export default EditorWrapper;
