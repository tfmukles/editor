import { Dialog } from "@/components/ui/dialog";

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";
import { Arrangement, ITree } from "@/types";
import { Dispatch, SetStateAction } from "react";

import FileForm from "./file-form";
import FolderForm from "./folder-form";
import HeadingForm from "./heading-form";

const formComponent = {
  folder: FolderForm,
  file: FileForm,
  heading: HeadingForm,
};

export default function ArrangementDialog({
  type,
  arrangements,
  handleArrangement,
  dialogTrigger,
  setType,
  trees,
}: {
  type: "folder" | "file" | "heading" | undefined;
  arrangement?: Arrangement;
  trees: ITree[];
  dialogTrigger: React.ReactNode;
  setType?: Dispatch<SetStateAction<"folder" | "file" | "heading" | undefined>>;
  handleArrangement: ({
    newArrangement,
  }: {
    newArrangement: Arrangement;
  }) => void;
  arrangements: Arrangement[];
  handleUpdateArrangement: ({
    newArrangement,
  }: {
    newArrangement: Arrangement;
  }) => void;
  handleDelete: ({ newArrangement }: { newArrangement: Arrangement }) => void;
}) {
  const Form = type ? formComponent[type] : null;

  return (
    <Dialog>
      <DialogTrigger asChild>{dialogTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] gap-y-4">
        <DialogHeader>
          <DialogTitle>Arrange {type ?? "Folder"}</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div>
          <Label>Select a type:</Label>
          <Select
            value={type}
            onValueChange={(value) =>
              // @ts-ignore
              setType(value as "folder" | "file" | "heading" | undefined)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              <div className="p-2.5 max-w-full">
                <SelectItem className="px-2" value="folder">
                  Folder
                </SelectItem>
                <SelectItem className="px-2" value="file">
                  File
                </SelectItem>
                <SelectItem className="px-2" value="heading">
                  Heading
                </SelectItem>
              </div>
            </SelectContent>
          </Select>
        </div>
        {type && Form && (
          <Form
            handleArrangement={handleArrangement}
            trees={trees}
            arrangements={arrangements}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
