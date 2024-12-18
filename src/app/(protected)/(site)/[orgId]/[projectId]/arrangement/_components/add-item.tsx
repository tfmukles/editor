"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Arrangement, ITree } from "@/types";
import { Reorder } from "framer-motion";
import { useMemo, useRef, useState } from "react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { selectConfig, updateConfig } from "@/redux/features/config/slice";
import { useUpdateFilesMutation } from "@/redux/features/git/commitApi";
import { useAppDispatch } from "@/redux/store";
import { Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import ArrangementItem from "./arrangement-item";
import FileForm from "./file-form";
import FolderForm from "./folder-form";
import HeadingForm from "./heading-form";

const formComponent = {
  folder: FolderForm,
  file: FileForm,
  heading: HeadingForm,
};

const AddItem = ({ trees }: { trees: ITree[] }) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const config = useSelector(selectConfig);
  const [updateFile, { isLoading: isPending }] = useUpdateFilesMutation();
  const memoArrangement = useMemo(() => {
    return config.arrangement.map((arrangement) => ({
      ...arrangement,
      id: uuidv4(),
    }));
  }, []);

  const storeArrangement = useRef<Arrangement[]>(
    JSON.parse(JSON.stringify(memoArrangement)),
  );
  const [arrangements, setArrangement] =
    useState<Arrangement[]>(memoArrangement);
  const [type, setType] = useState<"folder" | "file" | "heading">();
  const Form = type ? formComponent[type] : null;
  const handleArrangement = ({
    newArrangement,
  }: {
    newArrangement: Arrangement;
  }) => {
    const foundedIndex = arrangements.findIndex(
      (arrangement) => arrangement.id === newArrangement.id,
    );

    if (foundedIndex !== -1) {
      const newArrangements = [...arrangements];
      newArrangements[foundedIndex] = newArrangement;
      setArrangement(newArrangements);
    } else {
      setArrangement([...arrangements, newArrangement]);
    }
  };
  const handleDelete = (id: string) => {
    setArrangement(arrangements.filter((arrangement) => arrangement.id !== id));
  };

  const isDeepEqual = (arr1: Arrangement[], arr2: Arrangement[]) => {
    // If lengths are different, they're not equal
    if (arr1.length !== arr2.length) return false;

    // Deep comparison of two objects, ignoring 'id'
    const deepEqual = (obj1: any, obj2: any): boolean => {
      if (obj1 === obj2) return true; // Primitive values
      if (typeof obj1 !== "object" || typeof obj2 !== "object") return false;
      if (!obj1 || !obj2) return false;

      const keys1 = Object.keys(obj1).filter((key) => key !== "id");
      const keys2 = Object.keys(obj2).filter((key) => key !== "id");

      if (keys1.length !== keys2.length) return false;

      return keys1.every((key) => deepEqual(obj1[key], obj2[key]));
    };

    // Compare corresponding elements in the arrays
    for (let i = 0; i < arr1.length; i++) {
      const { id: _, ...rest1 } = arr1[i];
      const { id: __, ...rest2 } = arr2[i];

      if (!deepEqual(rest1, rest2)) {
        return false; // Mismatch found at index `i`
      }
    }

    return true; // All elements match
  };

  const isChanged = !isDeepEqual(storeArrangement.current, arrangements);

  return (
    <>
      <div className="justify-self-end">
        <Dialog modal>
          <DialogTrigger asChild>
            <Button>Add new file</Button>
          </DialogTrigger>
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
                onValueChange={(value) => setType(value as "folder" | "file")}
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
      </div>

      <Card className="flex-1 w-full col-span-2">
        <CardContent className="p-0">
          <Reorder.Group
            axis="y"
            className="relative"
            onReorder={setArrangement}
            values={arrangements}
          >
            {!isChanged && arrangements.length <= 0 ? (
              <div className="col-span-6 h-full text-center space-y-2 flex flex-col justify-center">
                <img
                  className="mx-auto"
                  src={"/images/empty-folder.svg"}
                  width={300}
                  height={300}
                  alt="empty-folder"
                />
                <h2 className="text-center text-xl">No Files found!</h2>
                <p className="text-sm">
                  Looking a bit empty here! <br /> Let's add some files.
                </p>

                <div>
                  <Dialog modal>
                    <DialogTrigger asChild>
                      <Button className="!m-4">Add new file</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] gap-y-4">
                      <DialogHeader>
                        <DialogTitle>Arrange {type ?? "Folder"}</DialogTitle>
                        <DialogDescription>
                          Make changes to your profile here. Click save when
                          you're done.
                        </DialogDescription>
                      </DialogHeader>
                      <div>
                        <Label>Select a type:</Label>
                        <Select
                          value={type}
                          onValueChange={(value) =>
                            setType(value as "folder" | "file")
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
                </div>
              </div>
            ) : (
              <>
                {arrangements.map((arrangement) => {
                  return (
                    <ArrangementItem
                      key={arrangement.id}
                      arrangement={arrangement}
                      arrangements={arrangements}
                      handleArrangement={handleArrangement}
                      handleDelete={handleDelete}
                      trees={trees}
                    />
                  );
                })}
                <div className="p-4">
                  <Button
                    disabled={!isChanged || isPending}
                    onClick={async () => {
                      const updatedArrangements = arrangements.reduce<
                        Omit<Arrangement, "id">[]
                      >((acc, curr) => {
                        const { id, ...rest } = curr;
                        return [...acc, { ...rest }];
                      }, []);

                      updateFile({
                        files: [
                          {
                            path: ".sitepins/config.json",
                            content: JSON.stringify(
                              {
                                media: {
                                  root: config.media.root,
                                  public: config.media.public,
                                },
                                content: {
                                  root: config.content.root,
                                },
                                themeConfig: config.themeConfig,
                                arrangement: updatedArrangements,
                                showCommitModal: config.showCommitModal,
                              },
                              null,
                              2,
                            ),
                          },
                        ],
                        message: "Update arrangement",
                        owner: config.userName,
                        repo: config.repo,
                        tree: config.branch,
                      }).then((res) => {
                        if (!res.error?.message) {
                          toast({
                            title: "Successfully updated arrangement",
                          });
                          dispatch(
                            updateConfig({
                              ...config,
                              arrangement: arrangements,
                            }),
                          );
                          storeArrangement.current = arrangements;
                        }
                      });
                    }}
                    className="w-full"
                  >
                    Save{" "}
                    {isPending && (
                      <Loader2 className="animate-spin size-5 ml-2" />
                    )}
                  </Button>
                </div>
              </>
            )}
          </Reorder.Group>
        </CardContent>
      </Card>
    </>
  );
};

export default AddItem;
