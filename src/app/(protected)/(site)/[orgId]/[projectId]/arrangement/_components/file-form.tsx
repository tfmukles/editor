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

const fileFormSchema = z.object({
  file: z.string(),
  groupName: z.string().min(2, {
    message: "name must be at least 2 characters.",
  }),
});

export default function FileForm(props: {
  trees: ITree[];
  handleArrangement: ({
    newArrangement,
  }: {
    newArrangement: Arrangement;
  }) => void;
  arrangements: Arrangement[];
  arrangement?: Arrangement;
}) {
  const modalCloseRef = useRef<HTMLButtonElement>(null);
  const { arrangements, handleArrangement, trees, arrangement } = props;
  const config = useSelector(selectConfig);
  const fileForm = useForm<z.infer<typeof fileFormSchema>>({
    resolver: zodResolver(fileFormSchema),
    defaultValues: {
      file: arrangement?.targetPath ?? "",
      groupName: arrangement?.groupName ?? "",
    },
  });

  const options = useMemo(() => {
    return trees.reduce<{ value: string }[]>((acc, tree) => {
      if (tree.type === "blob" && tree.path?.startsWith(config.content.root)) {
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

  const targetFile = fileForm.watch("file");
  const groupName = fileForm.watch("groupName");

  useEffect(() => {
    const foundedIndex = arrangements.findIndex(
      (arrangement) =>
        arrangement.targetPath === targetFile &&
        arrangement.type === "file" &&
        arrangement.groupName === groupName,
    );
    const arrangement = arrangements?.[foundedIndex];
    if (
      foundedIndex !== -1 &&
      arrangement.type === "file" &&
      !props.arrangement
    ) {
      fileForm.setError("groupName", {
        message: "Group name already exists.",
      });
    }
  }, [targetFile, groupName]);

  return (
    <Form {...fileForm}>
      <form
        className="space-y-4"
        onSubmit={fileForm.handleSubmit(
          (data) => {
            const newArrangement: Arrangement = {
              type: "file",
              id: arrangement?.id || uuidv4(),
              targetPath: data.file,
              groupName: data.groupName,
            };

            handleArrangement({ newArrangement });
            modalCloseRef.current?.click();
          },
          (error) => {
            console.log(error);
          },
        )}
      >
        <FormField
          control={fileForm.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select File</FormLabel>
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
                      {field.value || "Select a file"}
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
          control={fileForm.control}
          name="groupName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="index" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <Button
            disabled={!fileForm.formState.isValid}
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
