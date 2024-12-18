"use client";
import { AcceptImages, MAX_SIZE } from "@/lib/constant";
import LoadImage from "@/partials/LoadImage";
import { cn } from "@udecode/cn";
import React from "react";
import { useDropzone } from "react-dropzone";
import BlurImage from "./BlurImage";
import { AspectRatio } from "./ui/aspect-ratio";
import { Icons } from "./ui/icons";
import { Input } from "./ui/input";

export const ImageUploader: React.FC<{
  children: React.ReactNode;
  value?: string;
  className?: string;
  afterUpload?: () => void;
}> = ({ children, value, afterUpload, className }) => {
  const [preview, setPreview] = React.useState<string | ArrayBuffer | null>("");

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    const reader = new FileReader();
    try {
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(acceptedFiles[0]);
    } catch (error) {
      setPreview(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: MAX_SIZE,
    accept: AcceptImages,
    noClick: true,
    noDrag: true,
  });

  if (value) {
    return (
      <div
        className={cn(
          "relative bg-stripes-gray aspect-video border border-border rounded-lg p-3",
          className,
        )}
      >
        <LoadImage path={value || ""}>
          {({ src, isLoading, ref }) => (
            <AspectRatio ratio={16 / 9}>
              <BlurImage
                ref={ref}
                src={!isLoading && !src ? "/images/placeholder.png" : src}
                width={400}
                height={400}
                alt={value || ""}
              />
            </AspectRatio>
          )}
        </LoadImage>
        {children}
      </div>
    );
  }

  return (
    <div className="border-dashed border-2  aspect-video max-w-sm border-spacing-6 border-input rounded-lg hover:bg-accent w-[384px] relative">
      <div {...getRootProps()} className=" group px-7 pt-7 pb-14">
        {preview && (
          <img
            src={preview as string}
            alt="Uploaded image"
            className="max-h-[400px] rounded-lg"
          />
        )}
        <Icons.cloudUpload
          className={`size-6 mx-auto ${preview ? "hidden" : "block"}`}
        />
        {/* Hiding the file input so it doesn't trigger */}
        <Input {...getInputProps()} type="file" style={{ display: "none" }} />
      </div>

      <div className="absolute left-0 bottom-2 right-0">
        {isDragActive ? (
          <p className="text-center">Drag here</p>
        ) : (
          <p className="text-sm text-center">{children}</p>
        )}
      </div>
    </div>
  );
};
