"use client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useDialog } from "@/hooks/useDialog";

import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FileUploader from "./file-uploader";

export default function DragDropModal({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen, onOpenChange } = useDialog();

  return (
    <>
      <div
        onDragEnter={() => {
          onOpenChange(true);
        }}
        className="flex-1 flex flex-col"
      >
        {children}
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Upload files</DialogTitle>
              <DialogDescription>
                Drag and drop your files here or click to browse.
              </DialogDescription>
            </DialogHeader>
            <FileUploader dropZone afterUpload={() => onOpenChange(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
