"use client";

import { Button, ButtonProps } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useDialog } from "@/hooks/useDialog";
import { SCHEMA_FOLDER } from "@/lib/constant";
import { convertSchema, extractFolderName } from "@/lib/utils/generateSchema";
import { createSchema } from "@/lib/validate";
import { selectConfig } from "@/redux/features/config/slice";
import { useUpdateFilesMutation } from "@/redux/features/git/commitApi";
import { useGetContentQuery } from "@/redux/features/git/contentApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@udecode/cn";
import { Check, Loader2, Trash2 } from "lucide-react";
import { usePathname } from "next/navigation";
import path from "path";
import { ReactNode, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import * as z from "zod";

type Template = {
  label: string;
  name: string;
  type: string;
  value: string;
  description?: string;
  isIgnored?: boolean;
  isRequired?: boolean;
};

type Props = {
  children: ReactNode;
  filePath: string;
  group: string;
  schemaDir: string;
} & ButtonProps;

export default function CreateSchema({
  children,
  filePath,
  group,
  schemaDir,
  ...props
}: Props) {
  const [template, setTemplate] = useState<Template[]>();
  const { toast } = useToast();
  const pathname = usePathname();
  const config = useSelector(selectConfig);
  const {
    data: schemaData,
    isFetching: isSchemaFetching,
    refetch,
  } = useGetContentQuery({
    owner: config.userName,
    repo: config.repo,
    ref: config.branch,
    path: schemaDir,
    parser: true,
  });

  const schema = schemaData?.data;

  const { isOpen, onOpenChange } = useDialog();
  const createSchemaForm = useForm<z.infer<typeof createSchema>>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      name: group ?? extractFolderName(filePath),
      file: "",
      template: [],
      fileType: "md",
      fmType: "yaml",
    },
  });

  useEffect(() => {
    if (schema) {
      createSchemaForm.setValue("file", schema.file);
      createSchemaForm.setValue("fmType", schema.fmType);
      createSchemaForm.setValue("fileType", schema.fileType);
      createSchemaForm.setValue("name", schema.name);
      setTemplate(schema.template || []);
    }
  }, [schema]);

  const selectedFile = createSchemaForm.watch("file");

  const [schemaCreate, { isLoading: isPending }] = useUpdateFilesMutation();

  const {
    data: response,
    isLoading,
    isFetching,
    isSuccess,
  } = useGetContentQuery(
    {
      owner: config.userName,
      repo: config.repo,
      ref: config.branch,
      path: selectedFile,
      parser: true,
    },
    {
      refetchOnMountOrArgChange: true,
      skip: !selectedFile || schema?.template,
    },
  );

  useEffect(() => {
    if (isSuccess && response.data) {
      const data = response.data;
      const template = convertSchema(data);
      setTemplate(template as any);
      createSchemaForm.setValue("fmType", response.fmType);
      createSchemaForm.setValue(
        "fileType",
        path.parse(selectedFile).ext.replace(".", "") as any,
      );
    }
  }, [isSuccess, isLoading, response]);

  const onChangeHandler = (value: Template) => {
    setTemplate(
      template?.map((item) => {
        if (item.name === value.name) {
          return { ...item, ...value };
        }
        return item;
      }),
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button {...props} type="button">
          <span className="flex-1 text-sm capitalize">
            {schema ? "Edit Schema" : "Create Schema"}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[500px] w-full overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {schema ? "Edit Schema" : "Create Schema"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <Form {...createSchemaForm}>
            <form
              className="space-y-3"
              onSubmit={createSchemaForm.handleSubmit(
                async (data) => {
                  const schemaName = extractFolderName(pathname!);
                  schemaCreate({
                    files: [
                      {
                        content: JSON.stringify(
                          {
                            ...data,
                            template: template,
                          },
                          null,
                          2,
                        ),
                        path: SCHEMA_FOLDER + "/" + schemaName + ".json",
                      },
                    ],
                    message: `Create ${data.name} schema`,
                    owner: config.userName,
                    repo: config.repo,
                    tree: config.branch,
                  }).then((res) => {
                    if (!res.error?.message) {
                      refetch();
                      toast({
                        title: schemaData
                          ? "Update schema successfully!"
                          : "Schema created successfully!",
                      });
                      onOpenChange(false);
                    }
                  });
                },
                (err) => {
                  console.log(err);
                },
              )}
            >
              {!schema && (
                <div>
                  <FormField
                    control={createSchemaForm.control}
                    name={"file"}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Please Select a File.
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                            }}
                            value={field.value}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a file" />
                            </SelectTrigger>
                            <SelectContent>{children}</SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {isFetching || isSchemaFetching ? (
                <div className="py-6 text-center space-x-3 flex justify-center">
                  <p>Please wait...</p>
                  <Loader2 className="animate-spin size-6" />
                </div>
              ) : (
                <ul className="space-y-3">
                  {template?.map((item, index) => {
                    return (
                      <li key={item.name + index}>
                        <Card>
                          <CardContent
                            className={cn(
                              "p-6 space-y-3 relative",
                              item.isIgnored && "opacity-50",
                            )}
                          >
                            <div className="">
                              <Label className="capitalize">{item.name}</Label>
                              <Button
                                size={"icon"}
                                type="button"
                                className="absolute top-1 right-4"
                                variant={"ghost"}
                                onClick={() =>
                                  onChangeHandler({
                                    ...item,
                                    isIgnored: !item.isIgnored,
                                  })
                                }
                              >
                                {item.isIgnored ? (
                                  <Check className="inline-block text-success opacity-100 relative z-50" />
                                ) : (
                                  <Trash2 className="inline-block text-destructive" />
                                )}
                              </Button>
                            </div>

                            <Select
                              key={item.name + index}
                              defaultValue={item.type}
                              onValueChange={(value) => {
                                onChangeHandler({
                                  ...item,
                                  type: value,
                                });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="string">String</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="boolean">Boolean</SelectItem>
                                <SelectItem value="media">Media</SelectItem>
                                <SelectItem value="gallery">Gallery</SelectItem>
                                <SelectItem value="Array">Array</SelectItem>
                                <SelectItem value="Date">Date</SelectItem>
                                <SelectItem
                                  disabled={item.type !== "object"}
                                  value="object"
                                >
                                  Object
                                </SelectItem>
                              </SelectContent>
                            </Select>

                            <div>
                              <Label
                                className="mb-3 inline-block"
                                htmlFor="label"
                              >
                                Label
                              </Label>
                              <Input
                                id="name"
                                type="text"
                                name="label"
                                className="w-full"
                                placeholder="label"
                                defaultValue={item.label}
                                onChange={(e) => {
                                  onChangeHandler({
                                    ...item,
                                    label: e.target.value,
                                  });
                                }}
                              />
                            </div>

                            <div>
                              <Label
                                className="mb-3 inline-block"
                                htmlFor="description"
                              >
                                Description
                                {schema?.description}
                              </Label>
                              <Input
                                id="description"
                                type="text"
                                name="description"
                                className="w-full mb-3"
                                placeholder="description"
                                value={item?.description ?? ""}
                                onChange={(e) => {
                                  onChangeHandler({
                                    ...item,
                                    description: e.target.value,
                                  });
                                }}
                              />
                            </div>

                            <Label className="inline-flex items-center">
                              <span className="me-3 text-sm font-medium">
                                Required
                              </span>

                              <Switch
                                onCheckedChange={() => {
                                  onChangeHandler({
                                    ...item,
                                    isRequired: !item.isRequired,
                                  });
                                }}
                                checked={!!item.isRequired}
                              />
                            </Label>
                          </CardContent>
                        </Card>
                      </li>
                    );
                  })}
                </ul>
              )}

              <Button
                disabled={
                  schema ? isPending : isPending || selectedFile.length === 0
                }
                className="w-full mt-4"
                type="submit"
              >
                {!!schema ? "Update Schema" : "Create Schema"}
                {isPending && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
