import { TImage } from "@/actions/file/types";
import { Button, ButtonProps } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/useDebounce";
import { useDialog } from "@/hooks/useDialog";
import { AcceptImages, MAX_FILES, MAX_SIZE } from "@/lib/constant";
import {
  findFileByPath,
  generatePath,
  sanitizedPath,
  searchByPath,
} from "@/lib/utils/common";
import LoadImage from "@/partials/LoadImage";
import { selectConfig } from "@/redux/features/config/slice";
import { useUpdateFilesMutation } from "@/redux/features/git/commitApi";
import { useGetTreesQuery } from "@/redux/features/git/contentApi";
import { IFiles } from "@/types";
import { cn } from "@udecode/cn";
import { Loader } from "lucide-react";
import { usePathname } from "next/navigation";
import path from "path";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useSelector } from "react-redux";
import BlurImage from "./BlurImage";
import RenderImages from "./RenderImages";
import Search from "./Search";
import Warning from "./Warning";
import { AspectRatio } from "./ui/aspect-ratio";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Icons } from "./ui/icons";
import { Input } from "./ui/input";

type Props = {
  path: string;
  name: string;
  onChangeHandler: any;
  triggerButton?: React.ReactNode;
} & ButtonProps;

const ImagesList = ({
  triggerButton,
  path: filepath,
  name,
  onChangeHandler,
  ...props
}: Props) => {
  const pathname = usePathname();
  const [updateImage, { isLoading: isUploading }] = useUpdateFilesMutation();
  const [isLoading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const { dir: folder, name: filename } = path.parse(filepath ?? "");
  const config = useSelector(selectConfig);
  const configPath = config.media.public;
  const { data } = useGetTreesQuery({
    owner: config.userName,
    repo: config.repo,
    recursive: "1",
    tree_sha: config.branch,
  });

  const files = data?.trees ?? [];

  const [images, setImage] = useState<TImage[]>([]);
  const { isOpen, onOpenChange } = useDialog();

  const handleUpload = async (inputFiles: any[]) => {
    const newImages: TImage[] = [];
    for (const file of inputFiles) {
      const fileContent = await file.arrayBuffer();
      const contentBase64 = Buffer.from(fileContent).toString("base64");
      const targetPath = sanitizedPath(config.media.root, folder);
      const isAlreadyExit = findFileByPath(
        files![1].children!,
        sanitizedPath("media", path.join(targetPath, file.name)),
      );

      const number: number = Math.max(
        ...(isAlreadyExit?.children?.reduce<number[]>((acc, curr) => {
          const regex = /(_|-)copy(?:\((\d+)\))?$/;

          const [fileName, _] = curr.name.split(".");
          const match = fileName.match(regex);

          if (match && file.name.includes(file.name)) {
            const [, , number] = match;
            const extractedNumber = number ? parseInt(number, 10) : 0;
            return [...acc, extractedNumber];
          }

          return acc;
        }, []) || []),
        0,
      );

      newImages.push({
        number,
        name: file.name,
        path: sanitizedPath(targetPath, file.name),
        isAlreadyExit: !!isAlreadyExit,
        content: contentBase64,
        isNew: true,
      });
    }
    setImage(newImages);
  };

  const duplicateImages = useMemo(() => {
    return images.filter((item) => item.isAlreadyExit === true);
  }, [images]);

  useEffect(() => {
    if (duplicateImages.length <= 0 && images.length > 0) {
      updateImage({
        owner: config.userName,
        repo: config.repo,
        tree: config.branch,
        message: "Uploading images...",
        files: images.map((item) => ({
          path: item.path,
          content: item.content,
        })),
      }).then(() => {
        toast({
          description: "Uploaded successfully",
        });
        setImage([]);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      });
    } else {
      if (inputRef.current) {
        inputRef.current.value = ""; // Clear the input files
      }
    }
  }, [images, duplicateImages]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    handleUpload(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      maxFiles: MAX_FILES,
      maxSize: MAX_SIZE,
      accept: AcceptImages,
    });

  const debouncedSearch = useDebounce(search, 500);
  const filteredImages = useMemo(() => {
    setLoading(true);
    const search = searchByPath(files![1].children!, debouncedSearch);
    setLoading(false);

    return search;
  }, [debouncedSearch]);

  const [newUploadedImages] = useState<IFiles[]>([]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          {triggerButton ? triggerButton : <Button {...props}>Replace</Button>}
        </DialogTrigger>
        <DialogContent className="max-w-3xl gap-3">
          <Warning
            images={duplicateImages}
            setImages={setImage}
            currentDir={sanitizedPath(config.media.root, folder)}
            className="left-1/2"
          />
          <DialogHeader>
            <DialogTitle>Choose Image</DialogTitle>
          </DialogHeader>
          <div
            className={cn(
              "border bg-accent border-border text-center rounded p-6 relative",
              isDragActive && "bg-yellow-500 text-white",
            )}
            {...getRootProps()}
          >
            <Input
              {...getInputProps()}
              type="file"
              style={{ display: "none" }}
            />

            <Icons.cloudUpload className="mx-auto text-primary/55" />
            <div>
              <span className="text-primary/75 text-sm">Drag and drop or</span>{" "}
              <Button className="p-0 text-sm" variant={"link"}>
                Choose file
              </Button>
            </div>
            {fileRejections.length !== 0 && (
              <p className="text-destructive">
                Image must be less than {MAX_SIZE / 1000000}Mb and of type png,
                jpg, or jpeg
              </p>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/75 backdrop-blur-[1px]	 flex z-50 justify-center items-center">
                <Loader className="animate-spin text-white  w-8 h-8" />
              </div>
            )}
          </div>

          {isUploading && (
            <div className="absolute inset-0 bg-dark/75 backdrop-blur-[1px] cursor-not-allowed	flex z-50 justify-center items-center" />
          )}

          <div>
            <Search
              isLoading={search !== debouncedSearch || isLoading}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              value={search}
              className="bg-accent"
            />
          </div>

          <div className="g-4 mt-1 max-h-96 overflow-y-auto z-10 grid grid-cols-3 gap-4">
            {filteredImages.length === 0 ? (
              <div className="text-center col-span-3">
                <div className="max-w-sm mx-auto space-y-3">
                  <h2>No Images Found for "{debouncedSearch}"</h2>
                  <p>
                    It looks like there are no images associated with the name "
                    {debouncedSearch}". Please try a different search term or
                    upload a new image!
                  </p>
                </div>
              </div>
            ) : (
              <>
                {newUploadedImages.map((item) => {
                  return (
                    <div key={item.path}>
                      <AspectRatio
                        ratio={16 / 9}
                        className="border border-border rounded-lg"
                      >
                        {item.isNew && (
                          <Badge
                            variant={"destructive"}
                            className="absolute top-2 right-2 z-10"
                          >
                            New
                          </Badge>
                        )}

                        <LoadImage
                          lazy
                          path={sanitizedPath(
                            configPath,
                            item.path.replace("media", ""),
                          )}
                        >
                          {({ src, ref, isLoading }) => (
                            <>
                              <BlurImage ref={ref} src={src} alt={item.name} />
                              <input
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  onOpenChange();
                                  onChangeHandler(e);
                                }}
                                name={name}
                                type="text"
                                value={
                                  "/" +
                                  generatePath(
                                    configPath,
                                    item.path.replace("media", ""),
                                  )
                                }
                                className="absolute inset-0 z-50 opacity-0 cursor-pointer"
                                readOnly
                              />
                            </>
                          )}
                        </LoadImage>
                      </AspectRatio>
                    </div>
                  );
                })}

                <RenderImages
                  onClose={onOpenChange}
                  onChangeHandler={onChangeHandler}
                  name={name}
                  files={filteredImages}
                  path={filepath}
                />
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImagesList;
