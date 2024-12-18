"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { DialogClose } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { selectConfig } from "@/redux/features/config/slice";
import { Arrangement, ITree } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { PopoverClose } from "@radix-ui/react-popover";
import { cn } from "@udecode/cn";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const folderFormSchema = z.object({
  type: z.string(),
  targetPath: z.string(),
  groupName: z.string().min(2, {
    message: "name must be at least 2 characters.",
  }),
  include: z.string(),
  exclude: z.string(),
});

export default function FolderForm(props: {
  trees: ITree[];
  handleArrangement: ({
    newArrangement,
  }: {
    newArrangement: Arrangement;
  }) => void;
  arrangements: Arrangement[];
  arrangement?: Arrangement;
}) {
  const { arrangement, arrangements, trees, handleArrangement } = props;
  const modalCloseRef = useRef<HTMLButtonElement>(null);
  const config = useSelector(selectConfig);
  const folderForm = useForm<z.infer<typeof folderFormSchema>>({
    resolver: zodResolver(folderFormSchema),
    defaultValues: {
      type: "folder",
      targetPath: arrangement?.targetPath || "",
      include: arrangement?.type === "folder" ? arrangement?.include || "" : "",
      exclude: arrangement?.type === "folder" ? arrangement?.exclude || "" : "",
      groupName: arrangement?.groupName || "",
    },
  });

  const targetFolder = folderForm.watch("targetPath");
  const groupName = folderForm.watch("groupName");

  const options = useMemo(() => {
    return trees.reduce<{ value: string }[]>((acc, tree) => {
      if (tree.type === "tree" && tree.path?.startsWith(config.content.root)) {
        return [
          ...acc,
          {
            value: tree.path!,
          },
        ];
      }
      return acc;
    }, []);
  }, [JSON.stringify(trees)]);

  useEffect(() => {
    const foundedIndex = arrangements.findIndex(
      (arrangement) =>
        arrangement.targetPath === targetFolder &&
        arrangement.type === "folder" &&
        arrangement.groupName === groupName,
    );
    const arrangement = arrangements?.[foundedIndex];
    if (
      foundedIndex !== -1 &&
      arrangement.type === "folder" &&
      !props.arrangement
    ) {
      folderForm.setError("groupName", {
        message: "Group name already exists.",
      });
    }
  }, [targetFolder, groupName]);

  return (
    <Form {...folderForm}>
      <form
        className="space-y-4"
        onSubmit={folderForm.handleSubmit((data) => {
          const newArrangement: Arrangement = {
            id: arrangement?.id || uuidv4(),
            type: "folder",
            targetPath: data.targetPath,
            groupName: data.groupName,
            include: data.include,
            exclude: data.exclude,
          };
          handleArrangement({
            newArrangement,
          });
          modalCloseRef.current?.click();
        })}
      >
        <FormField
          control={folderForm.control}
          name={"targetPath"}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Folder</FormLabel>
              <FormControl>
                <Popover modal>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded
                      className="w-full h-auto justify-between hover:text-foreground hover:bg-transparent space-y-0 !mt-0"
                      disabled={!!arrangement}
                    >
                      {field.value || "Select a folder"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    collisionPadding={10}
                    className="p-0 w-[--radix-popper-anchor-width]"
                  >
                    <Command>
                      <CommandInput
                        placeholder="Search repository..."
                        className="border-none focus-visible:border-none focus:ring-0"
                      />
                      <CommandList className="max-h-[200px]">
                        <CommandEmpty>No folder found</CommandEmpty>
                        <CommandGroup>
                          {options?.map((option) => {
                            return (
                              <CommandItem
                                asChild
                                value={option.value}
                                onSelect={(currentValue) => {
                                  field.onChange(currentValue);
                                }}
                                key={option.value}
                              >
                                <PopoverClose className="w-full">
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      option.value === field.value
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  {option.value}
                                </PopoverClose>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          shouldUnregister
          control={folderForm.control}
          name="groupName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="blog list"
                  {...field}
                  disabled={!!arrangement}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={folderForm.control}
          name="include"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Include</FormLabel>
              <FormControl>
                <Input placeholder="*.md" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={folderForm.control}
          name="exclude"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Exclude</FormLabel>
              <FormControl>
                <Input placeholder="*index.md" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <Button
            disabled={!folderForm.formState.isValid}
            size={"lg"}
            type="submit"
            className="w-full"
          >
            {!!arrangement ? "Update" : "Add"}
          </Button>

          <DialogClose ref={modalCloseRef} className="sr-only">
            Close
          </DialogClose>
        </div>
      </form>
    </Form>
  );
}
