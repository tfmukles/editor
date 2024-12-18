"use client";

import { TImage } from "@/actions/file/types";
import BlurImage from "@/components/BlurImage";
import Warning from "@/components/Warning";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button, ButtonProps } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AcceptImages, MAX_FILES, MAX_SIZE } from "@/lib/constant";
import {
  findFileByPath,
  getFileNameAndExtension,
  sanitizedPath,
} from "@/lib/utils/common";
import { selectConfig } from "@/redux/features/config/slice";
import { useUpdateFilesMutation } from "@/redux/features/git/commitApi";
import { useGetTreesQuery } from "@/redux/features/git/contentApi";
import { addNewMedia } from "@/redux/features/media-manager/slice";
import { useAppDispatch } from "@/redux/store";
import { cn } from "@udecode/cn";
import { Loader, Loader2, Upload, UploadIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useDropzone } from "react-dropzone";
import { useSelector } from "react-redux";

export default function FileUploader({
  dropZone,
  afterUpload,
  dropAndReplace,
  children,
  ...props
}: ButtonProps & {
  dropZone?: boolean;
  afterUpload?: () => void;
  dropAndReplace?: boolean;
  children?: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  let pathname = usePathname();
  const config = useSelector(selectConfig);
  pathname = decodeURIComponent(pathname);
  const [previews, setPreviews] = useState<string[]>([]);
  const { data } = useGetTreesQuery({
    owner: config.userName,
    repo: config.repo,
    tree_sha: config.branch,
    recursive: "1",
  });
  const trees = data?.trees || [];
  const [uploadImage, { isLoading: isPending }] = useUpdateFilesMutation();
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const filePreviews = acceptedFiles.map((file) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      return new Promise<string>((resolve) => {
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
      });
    });

    Promise.all(filePreviews).then((previews) => {
      setPreviews(previews);
    });
  }, []);

  const [images, setImages] = useState<TImage[]>([]);
  const {
    getRootProps,
    getInputProps,
    acceptedFiles,
    isDragActive,
    inputRef,
    fileRejections,
  } = useDropzone({
    maxFiles: MAX_FILES,
    maxSize: MAX_SIZE,
    accept: AcceptImages,
    onDrop: dropZone
      ? onDrop
      : (acceptedFiles) => {
          handleUpload(acceptedFiles);
        },
  });

  const currentDir = "media/" + pathname.split("media/")?.[1];
  const handleUpload = async (files?: File[]) => {
    if (!files) return;
    const newImages: TImage[] = [];

    for (const file of files) {
      const fileContent = await file.arrayBuffer();
      const contentBase64 = Buffer.from(fileContent).toString("base64");
      const currentFolderFiles = findFileByPath(
        trees![1].children!,
        sanitizedPath(currentDir),
      );

      const isAlreadyExit = currentFolderFiles?.children?.find(
        (child) => child.name === file.name,
      );

      const number: number = Math.max(
        ...(currentFolderFiles?.children?.reduce<number[]>(
          (acc, curr) => {
            const regex = /(_|-)copy(?:\((\d+)\))?$/;
            const [fileName, _] = getFileNameAndExtension(curr.path);
            const match = fileName.match(regex);

            if (match && file.name.includes(file.name)) {
              const [, , number] = match;
              const extractedNumber = number ? parseInt(number, 10) : 0;
              return [...acc, extractedNumber];
            }

            return acc;
          },
          [0],
        ) || [0]),
      );

      newImages.push({
        number,
        name: file.name,
        path: sanitizedPath(currentDir.replace("media/", ""), file.name),
        isAlreadyExit: !!isAlreadyExit,
        content: contentBase64,
        isNew: true,
      });
    }
    setImages(newImages);
  };

  const duplicateImages = useMemo(() => {
    return images.filter((item) => item.isAlreadyExit === true);
  }, [images]);

  useEffect(() => {
    if (duplicateImages.length <= 0 && images.length > 0) {
      uploadImage({
        owner: config.userName,
        repo: config.repo,
        tree: config.branch,
        message: "uploads images",
        files: images,
      }).then((res) => {
        if (!res.error?.message) {
          dispatch(
            addNewMedia(
              images.map((image) => ({
                isFile: true,
                name: image.name,
                path: `media/${image.path}`,
                sha: null,
                isNew: true,
              })),
            ),
          );
          setImages([]);
          toast({
            title: "Upload image successfully",
          });
          if (afterUpload) {
            afterUpload();
          }
          if (inputRef.current) {
            inputRef.current.value = "";
            inputRef.current.files = null;
          }
        }
      });
    }
  }, [images.length, duplicateImages.length]);

  const content = (
    <>
      {isPending &&
        createPortal(
          <div className="fixed left-0 z-[100] w-full top-0  h-full flex items-center justify-center bg-dark/20 backdrop-blur-sm">
            <Loader className="animate-spin w-6 h-6 text-text-light" />
          </div>,
          document.body!,
        )}

      <Warning
        currentDir={currentDir.replace("media/", "")}
        images={duplicateImages}
        setImages={setImages}
        className={cn(dropZone && "left-1/2 w-full")}
      />
    </>
  );

  if (dropZone) {
    return (
      <>
        {content}
        <div
          {...getRootProps()}
          className={cn(
            "group relative grid h-52 w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-5 py-2.5 text-center transition hover:bg-muted/25",
            "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            isDragActive && "border-muted-foreground/50",
          )}
        >
          <input {...getInputProps()} />

          {isDragActive ? (
            <div className="flex flex-col items-center justify-center gap-4 overflow-y-scroll sm:px-5">
              <div className="rounded-full border border-dashed p-3">
                <UploadIcon
                  className="size-7 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
              <p className="font-medium text-muted-foreground">
                Drop the files here
              </p>
            </div>
          ) : (
            <div className="max-h-full overflow-y-auto items-center">
              {acceptedFiles.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {previews.map((preview, index) => {
                    return (
                      <div
                        key={index}
                        className="border border-border pb-2 rounded-lg"
                      >
                        <AspectRatio
                          ratio={1 / 1}
                          className="group  bg-light rounded-lg w-full relative flex items-center justify-center"
                        >
                          <BlurImage
                            src={preview}
                            width={20}
                            height={20}
                            alt="preview image"
                            className="rounded-lg"
                          />
                        </AspectRatio>
                        <p className="mt-1 line-clamp-1">
                          {acceptedFiles[index]?.name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <>
                  <div>
                    <div className="rounded-full border border-dashed p-3 inline-block">
                      <UploadIcon
                        className="size-7 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                  <p className="font-medium text-muted-foreground">
                    Drag {`'n'`} drop files here, or click to select files
                  </p>
                  <p className="text-sm text-muted-foreground/70">
                    You can upload
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        <Button
          onClick={() => {
            if (acceptedFiles.length) {
              handleUpload(acceptedFiles);
            }
          }}
          disabled={isPending || acceptedFiles.length <= 0}
        >
          <Upload className="mr-1.5 size-4" />
          <span>
            Upload{" "}
            {isPending && (
              <Loader2 className="animate-spin w-4 h-4 inline-block" />
            )}
          </span>
        </Button>

        {fileRejections.length > 0 && (
          <ul className="text-destructive font-medium text-sm">
            {fileRejections.map((reject) => {
              return reject.errors.map((err) => {
                return <li key={err.code}>{err.message}</li>;
              });
            })}
          </ul>
        )}
      </>
    );
  }

  useEffect(() => {
    if (fileRejections.length) {
      toast({
        variant: "destructive",
        title: `Image must be less than ${MAX_SIZE / 1000000}Mb and of type png,
    jpg, or jpeg`,
      });
    }
  }, [fileRejections]);

  return (
    <>
      {content}
      <div {...getRootProps()}>
        <Button {...props} disabled={isPending}>
          <Upload className="mr-1.5 size-4" />
          <span>Upload</span>
          <input {...getInputProps()} />
        </Button>
      </div>
    </>
  );
}
