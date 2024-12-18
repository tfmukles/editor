import { Card, CardContent } from "@/components/ui/card";
import { Reorder } from "framer-motion";

import { Arrangement } from "@/types";
import { Dispatch, SetStateAction } from "react";
import FileForm from "./file-form";
import FolderForm from "./folder-form";
import HeadingForm from "./heading-form";

const formComponent = {
  folder: FolderForm,
  file: FileForm,
  heading: HeadingForm,
};

export default function ArrangementList({
  children,
  arrangements,
  setArrangement,
}: {
  children: React.ReactNode;
  arrangements: Arrangement[];
  setArrangement: Dispatch<SetStateAction<Arrangement[]>>;
}) {
  return (
    <Card className="flex-1 w-full col-span-2">
      <CardContent className="p-0">
        <Reorder.Group
          axis="y"
          className="relative"
          onReorder={setArrangement}
          values={arrangements}
        >
          {children}
        </Reorder.Group>
      </CardContent>
    </Card>
  );
}
