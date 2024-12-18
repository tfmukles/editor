import { useRaisedShadow } from "@/hooks/useRiseDrag";
import { useDragControls, useMotionValue } from "framer-motion";

import { Reorder } from "framer-motion";

import { Arrangement, ITree } from "@/types";
import { File, Folder, Heading, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import DeleteArrangement from "./delete-arrangement";
import FileForm from "./file-form";
import FolderForm from "./folder-form";
import HeadingForm from "./heading-form";
import { ReorderIcon } from "./recorder-icon";

const formComponent = {
  folder: FolderForm,
  file: FileForm,
  heading: HeadingForm,
};

const icons = {
  file: File,
  folder: Folder,
  heading: Heading,
};

export default function ArrangementItem({
  arrangements,
  arrangement,
  trees,
  handleArrangement,
  handleDelete,
}: {
  arrangements: Arrangement[];
  arrangement: Arrangement;
  trees: ITree[];
  handleDelete: (id: string) => void;
  handleArrangement: ({
    newArrangement,
  }: {
    newArrangement: Arrangement;
  }) => void;
}) {
  const y = useMotionValue(0);
  const boxShadow = useRaisedShadow(y);
  const dragControls = useDragControls();
  const Icon = icons[arrangement.type];
  const Form = arrangement.type ? formComponent[arrangement.type] : null;

  return (
    <Reorder.Item
      className="border-b bg-white items-center py-4 last:border-b-0 px-2 flex pl-2"
      value={arrangement}
      id={arrangement.id}
      style={{ y, boxShadow }}
      dragListener={false}
      dragControls={dragControls}
    >
      <ReorderIcon dragControls={dragControls} />
      <div className="flex-1 flex select-none justify-between items-center">
        <span>
          <Icon className="mr-2 size-6 inline-block" />
          {arrangement.groupName}
        </span>
        <div>
          <Dialog modal>
            <DialogTrigger asChild>
              <Button size={"icon"} variant={"ghost"}>
                <Settings />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] gap-y-4">
              <DialogHeader>
                <DialogTitle>
                  Arrange {arrangement.type ?? "Folder"}
                </DialogTitle>
                <DialogDescription>
                  Make changes to your profile here. Click save when you're
                  done.
                </DialogDescription>
              </DialogHeader>

              {arrangement.type && Form && (
                <Form
                  handleArrangement={handleArrangement}
                  trees={trees}
                  arrangements={arrangements}
                  arrangement={arrangement}
                />
              )}
            </DialogContent>
          </Dialog>
          <DeleteArrangement handleDelete={handleDelete} id={arrangement.id} />
        </div>
      </div>
    </Reorder.Item>
  );
}
