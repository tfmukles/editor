import { getFileNameAndExtension } from "@/lib/utils/common";
import { IFiles } from "@/types";
import { cn } from "@udecode/cn";
import { FileQuestion } from "lucide-react";

type NewImage = Omit<IFiles, "children" | "isFile" | "isNew" | "sha"> & {
  isAlreadyExit: boolean;
  content: string;
  number: number;
};

const Warning = ({
  images,
  setImages,
  className,
  currentDir,
}: {
  images: NewImage[];
  setImages: React.Dispatch<React.SetStateAction<NewImage[]>>;
  className?: string;
  currentDir: string;
}) => {
  function replace(name: string) {
    setImages((images) => {
      return images.map((image) => {
        if (image.name === name) {
          return {
            ...image,
            isAlreadyExit: false,
            isReplace: true,
            isNew: false,
          };
        }
        return { ...image };
      });
    });
  }

  function stop(name: string) {
    setImages((images) => {
      return images.filter((image) => image.name !== name);
    });
  }

  function keepBoth(name: string) {
    setImages((images) => {
      return images.map((image) => {
        if (image.name === name) {
          let [fileName, extension] = getFileNameAndExtension(name);
          fileName =
            fileName + "_copy(" + (image.number + 1) + ")." + extension;

          return {
            ...image,
            name: fileName,
            path: currentDir + "/" + fileName,
            isNew: true,
            isAlreadyExit: false,
            isReplace: false,
          };
        }
        return image;
      });
    });
  }

  return (
    <>
      {images.length > 0 && (
        <div
          className={cn(
            "fixed top-10 left-[calc(50%_+_238px)] -translate-x-1/2 overflow-hidden bg-white shadow-lg max-w-lg rounded-lg z-[100]",
            className,
          )}
        >
          {images.map((image, index) => {
            return (
              <div key={index} className="border-b border-gray-200 py-3 px-5">
                <div className="flex space-x-2.5">
                  <div>
                    <FileQuestion className="w-5 h-5 text-red-500" />
                  </div>
                  <p className="text-sm mb-3">
                    An item named `{image.name}` already exists in this
                    location. Do you want to replace it with the one you’re
                    moving?
                  </p>
                </div>
                <div className="space-x-2.5 text-right relative">
                  <button
                    onClick={() => keepBoth(image.name)}
                    type="button"
                    className="btn btn-sm btn-primary"
                  >
                    Keep both
                  </button>
                  <button
                    onClick={() => stop(image.name)}
                    type="button"
                    className="btn btn-sm btn-primary"
                  >
                    Stop
                  </button>
                  <button
                    onClick={() => replace(image.name)}
                    type="button"
                    className="btn btn-sm btn-primary"
                  >
                    Replace
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default Warning;
