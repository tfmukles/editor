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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { configFormSchema } from "@/lib/validate";
import { useUpdateFilesMutation } from "@/redux/features/git/commitApi";
import { IConfig, ITree } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { PopoverClose } from "@radix-ui/react-popover";
import { cn } from "@udecode/cn";
import { Check, ChevronsUpDown, Loader } from "lucide-react";
import path from "path";
import { Fragment, useMemo } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Switch } from "../ui/switch";
import MultipleSelector from "./multi-selctor";

const ConfigForm = ({
  className,
  config,
  trees,
}: {
  className?: string;
  config: IConfig;
  trees: ITree[];
}) => {
  const { toast } = useToast();
  const [updateConfig, { isLoading: isPending, isSuccess }] =
    useUpdateFilesMutation();
  const configFrom = useForm<z.infer<typeof configFormSchema>>({
    resolver: zodResolver(configFormSchema),
    defaultValues: {
      content_root: {
        value: config?.content?.root || "",
        label: config?.content?.root || "Select your content folder",
      },
      media_root: {
        value: config?.media?.root || "",
        label: config?.media?.root || "Select your media folder",
      },
      themeConfigurations: config.themeConfig || [],
      showCommitModal: config.showCommitModal || false,
    },
    mode: "onChange",
  });

  const isChanged = useMemo(() => {
    const {
      content_root: contentRoot,
      media_root: mediaRoot,
      themeConfigurations,
      showCommitModal,
    } = configFrom.getValues();
    return (
      contentRoot.value !== config.content?.root ||
      mediaRoot.value !== config.media?.root ||
      themeConfigurations.length !== config.themeConfig?.length ||
      showCommitModal !== config.showCommitModal
    );
  }, [configFrom.getValues()]);

  return (
    <Form {...configFrom}>
      <form
        onSubmit={configFrom.handleSubmit(async (data) => {
          updateConfig({
            files: [
              {
                path: ".sitepins/config.json",
                content: JSON.stringify(
                  {
                    media: {
                      root: data.media_root.value,
                      public: path.join(data.media_root.value, "../"),
                    },
                    content: {
                      root: data.content_root.value,
                    },
                    themeConfig: data.themeConfigurations,
                    arrangement: data?.arrangement ?? [],
                    showCommitModal: data.showCommitModal,
                  },
                  null,
                  2,
                ),
              },
            ],
            message: "Update config",
            owner: config.userName,
            repo: config.repo,
            tree: config.branch,
          }).then((res) => {
            if (!res.error?.message) {
              toast({
                title: config.content.root
                  ? "Config file updated successfully"
                  : "Config file created successfully",
              });
            }
          });
        })}
        className={cn("space-y-4", className)}
      >
        <FormField
          control={configFrom.control}
          name={"content_root"}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content Folder</FormLabel>
              <FormControl>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded
                      className="w-full h-auto justify-between hover:text-foreground hover:bg-transparent space-y-0 !mt-0"
                    >
                      {field.value.value || "Select your content folder"}
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
                          {trees?.map((tree, index) => {
                            if (
                              tree.type === "blob" ||
                              tree.path?.startsWith(".")
                            )
                              return <Fragment key={index} />;
                            return (
                              <CommandItem
                                asChild
                                value={tree.path}
                                onSelect={(currentValue) => {
                                  field.onChange({
                                    value: currentValue,
                                    label: currentValue,
                                  });
                                }}
                                key={index}
                              >
                                <PopoverClose className="w-full">
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      tree.path === field.value.value
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  {tree.path}
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
          control={configFrom.control}
          name={"media_root"}
          render={({ field }) => (
            <FormItem>
              <FormLabel> Media Root</FormLabel>
              <FormControl>
                <Popover modal>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded
                      className="w-full h-auto justify-between hover:text-foreground hover:bg-transparent space-y-0 !mt-0"
                    >
                      {field.value.value || "Select your media folder"}
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
                          {trees?.map((tree) => {
                            if (
                              tree.type === "blob" ||
                              tree.path?.startsWith(".")
                            )
                              return null;
                            return (
                              <CommandItem
                                value={tree.path}
                                key={tree.path}
                                onSelect={(currentValue) => {
                                  field.onChange({
                                    value: currentValue,
                                    label: currentValue,
                                  });
                                }}
                                asChild
                              >
                                <PopoverClose className="w-full">
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      tree.path === field.value.value
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  {tree.path}
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
          control={configFrom.control}
          name={"themeConfigurations"}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site Config</FormLabel>
              <FormControl>
                <MultipleSelector
                  badgeClassName="rounded"
                  options={trees?.map((tree) => ({
                    value: tree.path!,
                    label: tree.path!,
                  }))}
                  value={field.value.map((value) => ({
                    label: value,
                    value: value,
                  }))}
                  onChange={(values) => {
                    field.onChange(values.map((item) => item.value));
                  }}
                  inputProps={{
                    className:
                      "border-border focus-visible:border-none focus:ring-0 text-sm",
                  }}
                  placeholder="Select your config file..."
                  emptyIndicator={
                    <p className="text-center text-sm text-primary">
                      No results found.
                    </p>
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={configFrom.control}
          name="showCommitModal"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Show Commit Dialog</FormLabel>
                <FormDescription>
                  Show a confirmation dialog before committing changes to allow
                  adding commit messages and choosing commit options.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button
          disabled={isPending || !isChanged}
          type="submit"
          className="w-full"
        >
          Save {isPending && <Loader className="animate-spin ml-2 h-4 w-4" />}
        </Button>
      </form>
    </Form>
  );
};

export default ConfigForm;
