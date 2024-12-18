import ImagesList from "@/components/ImageList";
import { ImageUploader } from "@/components/file-upload";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { State } from "@/lib/context/type";
import { cn } from "@udecode/cn";
import { format } from "date-fns";
import { AnimatePresence, Variants, motion } from "framer-motion";
import { CalendarIcon, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  Dispatch,
  Fragment,
  KeyboardEvent,
  SetStateAction,
  useState,
} from "react";
import validateColor from "validate-color";

type Field = {
  label: string;
  type:
    | "media"
    | "gallery"
    | "number"
    | "Date"
    | "string"
    | "Array"
    | "object"
    | "boolean";
  name: string;
  value: string;
  fields?: Field[];
  description?: string;
  isIgnored?: boolean;
  isRequired?: boolean;
};

type Breadcrumb = {
  name: string;
  label: string;
  show?: boolean;
  index?: boolean;
};

const itemVariants: Variants = {
  exit: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: "auto" },
  hidden: { opacity: 0, height: 0 },
};

const AnimatedListItem = ({
  children,
  className,
  type,
}: {
  children: React.ReactNode;
  className?: string;
  type?: Field["type"];
}) => (
  <motion.li
    variants={itemVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
    layout="position"
    layoutScroll
    className={cn("space-y-2 overflow-hidden", className)}
    transition={{
      duration: 0.3,
      staggerChildren: 0.05,
    }}
  >
    {children}
  </motion.li>
);

export default function PreviewData({
  schema,
  data,
  setData,
}: {
  schema: Field[];
  data: State["data"];
  setData: Dispatch<SetStateAction<State | undefined>>;
}) {
  // Breadcrumb state stores names for internal navigation and labels for display
  const [breadcrumb, setBreadcrumb] = useState<Breadcrumb[]>([
    {
      name: "Root",
      label: "Root",
    },
  ]);

  // Helper function to access nested data based on breadcrumb
  const getNestedValue = (breadcrumb: Breadcrumb[], data: any): any => {
    return breadcrumb.slice(1).reduce((acc, curr) => {
      return acc && acc[curr.name];
    }, data);
  };

  // Helper function to find fields based on breadcrumb names
  const getCurrentField = (breadcrumb: Breadcrumb[], schema: Field[]) => {
    return breadcrumb
      .slice(1)
      .reduce<Field | undefined>((currentField, { name, index }) => {
        if (index) {
          return currentField;
        }
        const fields = currentField?.fields || schema;
        return fields.find((f) => f.name === name);
      }, undefined);
  };

  // Helper function to update nested data
  // Helper function to update nested data with proper type handling
  const setNestedValue = (
    breadcrumb: { name: string; label: string }[],
    value: any,
    index?: number,
  ) => {
    const newData = JSON.parse(JSON.stringify(data));
    let tempData = newData;

    // Handle root level updates when breadcrumb only has one item
    if (breadcrumb.length === 1) {
      const lastKey = breadcrumb[0].name;
      if (index !== undefined && Array.isArray(tempData[lastKey])) {
        tempData[lastKey][index] = value;
      } else {
        tempData[lastKey] = value;
      }
      setData((prev) => {
        if (!prev) return;
        return { ...prev, data: newData };
      });
      return;
    }

    // Handle nested updates
    for (let i = 1; i < breadcrumb.length - 1; i++) {
      const key = breadcrumb[i].name;
      if (tempData[key] === undefined) {
        const fieldInSchema = getCurrentField(
          breadcrumb.slice(0, i + 1),
          schema,
        )?.fields?.find((f) => f.name === key);
        tempData[key] = fieldInSchema?.type === "Array" ? [] : {};
      }
      tempData = tempData[key];
    }

    const lastKey = breadcrumb[breadcrumb.length - 1].name;

    if (index !== undefined && Array.isArray(tempData[lastKey])) {
      tempData[lastKey][index] = value;
    } else {
      tempData[lastKey] = value;
    }

    setData((prev) => {
      if (!prev) return;
      return { ...prev, data: newData };
    });
  };

  // Update data based on field changes
  const handleInputChange = ({
    name,
    value,
    index,
    isNested,
  }: {
    name: string;
    value: any;
    index?: number;
    isNested: boolean;
  }) => {
    // If we're at the root level (breadcrumb only has "Root")
    if (breadcrumb.length === 1 || !isNested) {
      setNestedValue([{ name, label: name }], value, index);
      return;
    }

    // For nested updates
    const newPath = [...breadcrumb, { name, label: name }];
    setNestedValue(newPath, value, index);
  };

  // Navigate forward by adding the field name and label to the breadcrumb
  const handleNavigate = ({
    item,
    isNested,
    parent,
    index,
    label,
  }: {
    item: Field;
    isNested: boolean;
    parent?: Field;
    index?: number;
    label?: string;
  }) => {
    // Handle Array type differently by adding an index to the breadcrumb
    if (parent && (index ?? -1) > -1) {
      if (!isNested) {
        setBreadcrumb((prevBreadcrumb) => [
          { name: "Root", label: parent.name },
          { name: item.name, label: label ?? item.label, show: false },
          {
            name: index?.toString() ?? "",
            label: label ?? index?.toString() ?? "",
            index: true,
          },
        ]);
      } else {
        setBreadcrumb((prevBreadcrumb) => [
          ...prevBreadcrumb,
          { name: item.name, label: item.label, show: false },
          { name: index?.toString() ?? "", label: label!, index: true },
        ]);
      }
      show: false;
    } else if (!isNested) {
      // Non-nested navigation (resetting to root + selected item)
      setBreadcrumb((prevBreadcrumb) => [
        { name: "Root", label: "Root" },
        { name: item.name, label: label ?? item.label },
      ]);
    } else if (item.fields) {
      // Nested navigation into object fields
      setBreadcrumb((prevBreadcrumb) => [
        ...prevBreadcrumb,
        { name: item.name, label: item.label },
      ]);
    }
  };

  const addItemToArray = (item: Field) => {
    const newPath = [...breadcrumb, { name: item.name, label: item.label }];

    const createNewItem = (fields: Field[]) => {
      if (!fields) {
        return "";
      }

      return fields.reduce((acc, field) => {
        switch (field.type) {
          case "string":
            acc[field.name] = ""; // Default to empty string
            break;
          case "number":
            acc[field.name] = 0; // Default to 0
            break;
          case "Date":
            acc[field.name] = new Date().toISOString(); // Default to current date
            break;
          case "media":
            acc[field.name] = ""; // Default to empty string
            break;
          case "gallery":
            acc[field.name] = []; // Default to empty array
            break;
          case "Array":
            acc[field.name] = field.fields ? createNewItem(field.fields) : [];
            break;
          case "object":
            // If the field is an object with nested fields, call createNewItem recursively
            acc[field.name] = field.fields ? createNewItem(field.fields) : {};
            break;
        }
        return acc;
      }, {} as any);
    };

    // Create a new item based on schema fields
    const newItem = createNewItem(item.fields!);

    // Get current array and add the new item
    const currentArray = getNestedValue(newPath, data) || [];

    const updatedArray = [...currentArray, newItem];

    // Set the new array with the added item
    setNestedValue(newPath, updatedArray);
  };

  const removeItemFromArray = (item: Field, index: number) => {
    const newPath = [...breadcrumb, { name: item.name, label: item.label }];
    // Get the current array based on breadcrumb path
    const currentArray = getNestedValue(newPath, data) || [];

    if (
      Array.isArray(currentArray) &&
      index >= 0 &&
      index < currentArray.length
    ) {
      // Create a new array without the item at the specified index
      const updatedArray = currentArray.filter((_, i) => i !== index);

      // Set the new array after removal
      setNestedValue(newPath, updatedArray);
    }
  };

  // Navigate to a specific breadcrumb level
  const handleBreadcrumbClick = (index: number) => {
    // Update the breadcrumb by slicing to the selected index
    const updatedBreadcrumb = breadcrumb.slice(0, index + 1);
    // Get the data relevant to the selected breadcrumb level
    // Update both breadcrumb and current data states
    setBreadcrumb(updatedBreadcrumb);
  };

  const handleKeyDown = (
    event:
      | React.KeyboardEvent<HTMLInputElement>
      | KeyboardEvent<SVGSVGElement>
      | KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent form submission
    }
  };

  // Render fields recursively based on the schema
  function renderItem({
    schema,
    isNested = false,
    parent,
    currentData,
  }: {
    schema: Field[];
    isNested?: boolean;
    parent?: Field;
    currentData: State["data"];
  }) {
    return (
      <ul className="flex flex-col space-y-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {schema?.map((item) => {
            if (item.isIgnored) {
              return null;
            } else if (
              breadcrumb.length > 1 &&
              item.name === breadcrumb[1].name &&
              !isNested
            ) {
              const { fields } = getCurrentField(breadcrumb, schema) || {};
              const currentData = getNestedValue(breadcrumb, data);

              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  // @ts-ignore
                  className="border border-border rounded-lg overflow-hidden relative"
                >
                  <nav className="mb-4 px-4 py-2 bg-light relative">
                    <Breadcrumb>
                      <BreadcrumbList>
                        {breadcrumb.map((crumb, index) => {
                          if (crumb.show === false || index === 0) {
                            return null;
                          }
                          return (
                            <Fragment key={index}>
                              <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                  <Button
                                    onClick={() => handleBreadcrumbClick(index)}
                                    variant={"link"}
                                    type="button"
                                    className="px-0 capitalize"
                                  >
                                    {crumb.label}
                                  </Button>
                                </BreadcrumbLink>
                              </BreadcrumbItem>
                              {index < breadcrumb.length - 1 && (
                                <BreadcrumbSeparator />
                              )}
                            </Fragment>
                          );
                        })}
                      </BreadcrumbList>
                    </Breadcrumb>

                    <Button
                      variant={"outline"}
                      size={"icon"}
                      className="rounded-full !size-7 absolute right-3 top-4"
                      onClick={() => {
                        setBreadcrumb([
                          {
                            name: "Root",
                            label: "Root",
                          },
                        ]);
                      }}
                    >
                      <X className="size-4" />
                    </Button>
                  </nav>

                  <div className="px-4 py-2">
                    {renderItem({
                      schema: fields!,
                      isNested: true,
                      parent,
                      currentData: currentData,
                    })}
                  </div>
                </motion.div>
              );
            } else if (item.type === "boolean" && item.name === "draft") {
              return null;
            } else if (item.type === "Date") {
              const value = currentData[item.name];
              return (
                <div key={item.name}>
                  <PreviewLabel {...item} className="text-sm border-none p-0">
                    {item.label}
                  </PreviewLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal hover:bg-gray-50 hover:text-foreground",
                          !value && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon
                          onKeyDown={handleKeyDown}
                          className="mr-2 h-4 w-4"
                        />
                        {value ? (
                          format(value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-full p-0">
                      <Calendar
                        mode="single"
                        initialFocus
                        selected={value}
                        onSelect={(date) => {
                          handleInputChange({
                            name: item.name,
                            value: date,
                            isNested: isNested,
                          });
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              );
            } else if (validateColor(item.value)) {
              return (
                <div key={item.name}>
                  <PreviewLabel {...item} className="text-sm">
                    {item.label}:
                  </PreviewLabel>
                  <Input
                    required={item.isRequired}
                    className="w-14"
                    name={item.name}
                    type="color"
                    value={currentData[item.name]}
                    onChange={(e) => {
                      handleInputChange({
                        name: item.name,
                        value: e.target.value,
                        isNested: isNested,
                      });
                    }}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              );
            } else if (item.type === "string") {
              return (
                <AnimatedListItem key={item.name}>
                  <PreviewLabel {...item}>{item.label}</PreviewLabel>
                  {currentData?.[item.name]?.length > 50 && false ? (
                    <Textarea
                      required={item.isRequired}
                      value={currentData?.[item.name] || ""}
                      onChange={(e) =>
                        handleInputChange({
                          name: item.name,
                          value: e.target.value,
                          isNested: isNested,
                        })
                      }
                      onKeyDown={handleKeyDown}
                    />
                  ) : (
                    <Input
                      required={item.isRequired}
                      value={currentData?.[item.name] || ""}
                      onKeyDown={handleKeyDown}
                      onChange={(e) =>
                        handleInputChange({
                          name: item.name,
                          value: e.target.value,
                          isNested: isNested,
                        })
                      }
                    />
                  )}
                  <Description {...item} />
                </AnimatedListItem>
              );
            } else if (item.type === "number") {
              return (
                <AnimatedListItem key={item.name}>
                  <Label>{item.label}</Label>
                  <Input
                    onKeyDown={handleKeyDown}
                    required={item.isRequired}
                    type="number"
                    value={currentData?.[item.name] || ""}
                    onChange={(e) =>
                      handleInputChange({
                        name: item.name,
                        value: e.target.value,
                        isNested: isNested,
                      })
                    }
                    className="appearance-none"
                  />
                  <Description {...item} />
                </AnimatedListItem>
              );
            } else if (item.type === "boolean") {
              return (
                <AnimatedListItem key={item.name}>
                  <div className="flex items-center space-x-3 space-y-0">
                    <PreviewLabel
                      {...item}
                      htmlFor={item.name}
                      className="mb-0"
                    >
                      {item.label}
                    </PreviewLabel>
                    <Switch
                      required={item.isRequired}
                      id={item.name}
                      checked={currentData?.[item.name]}
                      className="m-0"
                      onCheckedChange={(value) => {
                        handleInputChange({
                          name: item.name,
                          value: value,
                          isNested: isNested,
                        });
                      }}
                    />
                  </div>
                  <Description {...item} />
                </AnimatedListItem>
              );
            } else if (item.type === "gallery") {
              const values = currentData[item.name] as string[];

              return (
                <AnimatedListItem key={item.name}>
                  <div className="flex items-center">
                    <PreviewLabel
                      {...item}
                      className="flex justify-center items-center mb-0"
                    >
                      {item.label}
                    </PreviewLabel>
                    <Button
                      variant={"outline"}
                      type="button"
                      size={"icon"}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        addItemToArray(item);
                      }}
                      className="ml-2 size-6"
                    >
                      <Plus className="size-3" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {values?.length > 0 ? (
                      values?.map((image, i) => {
                        return (
                          <div key={i}>
                            <div className="inline-flex space-x-2">
                              {image ? (
                                <div
                                  className={
                                    "group max-w-sm h-56 relative after:absolute after:scale-0 after:origin-center after:left-0 after:top-0 after:w-full after:h-full after:bg-primary/40 rounded-lg after:rounded-[inherit] after:content-[''] after:opacity-0 after:invisible after:z-20 hover:after:visible hover:after:opacity-100 after:duration-300 hover:after:scale-100 after:transition-all"
                                  }
                                >
                                  <ImageUploader
                                    className="h-full w-full"
                                    value={image}
                                  >
                                    <ImagesList
                                      name={item.name}
                                      path={""}
                                      type="button"
                                      onChangeHandler={(e: any) => {
                                        const val = e.target.value;
                                        handleInputChange({
                                          name: item.name,
                                          value: val,
                                          isNested: isNested,
                                          index: i,
                                        });
                                      }}
                                      className="cursor-pointer absolute z-30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    />
                                  </ImageUploader>
                                </div>
                              ) : (
                                <ImageUploader
                                  className="h-full w-full "
                                  value={image}
                                >
                                  <ImagesList
                                    name={item.name}
                                    path={""}
                                    type="button"
                                    onChangeHandler={(e: any) => {
                                      const val = e.target.value;
                                      handleInputChange({
                                        name: item.name,
                                        value: val,
                                        index: i,
                                        isNested: isNested,
                                      });
                                    }}
                                    triggerButton={
                                      <Button
                                        variant={"link"}
                                        className="px-0 focus:ring-transparent focus-visible:outline-none focus-visible:ring-0 focus:border-none focus-visible:ring-transparent focus-visible:ring-offset-0"
                                      >
                                        Click to change
                                      </Button>
                                    }
                                  />
                                </ImageUploader>
                              )}
                              <Button
                                type="button"
                                className="hover:bg-destructive"
                                size={"icon"}
                                variant={"outline"}
                                onClick={() => {
                                  removeItemFromArray(item, i);
                                }}
                              >
                                <Trash2 />
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="bg-light text-text-dark">
                        <p className="font-semibold text-center py-3 rounded-lg">
                          There are no items
                        </p>
                      </div>
                    )}
                  </div>
                </AnimatedListItem>
              );
            } else if (item.type === "media") {
              return (
                <AnimatedListItem key={item.name}>
                  <PreviewLabel {...item}>{item.label}</PreviewLabel>
                  <div className="inline-flex justify-between space-x-4">
                    {currentData?.[item.name] ? (
                      <div
                        className={
                          "group max-w-sm h-56 relative after:absolute after:scale-0 after:origin-center after:left-0 after:top-0 after:w-full after:h-full after:bg-primary/40 rounded-lg after:rounded-[inherit] after:content-[''] after:opacity-0 after:invisible after:z-20 hover:after:visible hover:after:opacity-100 after:duration-300 hover:after:scale-100 after:transition-all"
                        }
                      >
                        <ImageUploader
                          className="h-full w-full"
                          value={currentData?.[item.name]}
                        >
                          <ImagesList
                            name={item.name}
                            path={""}
                            type="button"
                            onChangeHandler={(e: any) => {
                              const val = e.target.value;
                              handleInputChange({
                                name: item.name,
                                value: val,
                                isNested: isNested,
                              });
                            }}
                            className="cursor-pointer absolute z-30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          />
                        </ImageUploader>
                      </div>
                    ) : (
                      <ImageUploader
                        className="h-full w-full "
                        value={currentData?.[item.name]}
                      >
                        <ImagesList
                          name={item.name}
                          path={""}
                          type="button"
                          onChangeHandler={(e: any) => {
                            const val = e.target.value;
                            handleInputChange({
                              name: item.name,
                              value: val,
                              isNested: isNested,
                            });
                          }}
                          triggerButton={
                            <Button
                              variant={"link"}
                              className="px-0 focus:ring-transparent focus-visible:outline-none focus-visible:ring-0 focus:border-none focus-visible:ring-transparent focus-visible:ring-offset-0"
                            >
                              Click to change
                            </Button>
                          }
                        />
                      </ImageUploader>
                    )}

                    <Button
                      disabled={!currentData[item.name]}
                      className="hover:bg-destructive"
                      type="button"
                      size={"icon"}
                      variant={"outline"}
                      onClick={() => {
                        const val = "";
                        handleInputChange({
                          name: item.name,
                          value: val,
                          isNested: isNested,
                        });
                      }}
                    >
                      <Trash2 className="size-6" />
                    </Button>
                  </div>
                </AnimatedListItem>
              );
            } else if (item.type === "Array") {
              const values = currentData[item.name];

              return (
                <AnimatedListItem key={item.name}>
                  <div className="flex items-center">
                    <PreviewLabel
                      {...item}
                      className="flex justify-center items-center mb-0"
                    >
                      {item.label}
                    </PreviewLabel>
                    <Button
                      variant={"outline"}
                      type="button"
                      size={"icon"}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        addItemToArray(item);
                      }}
                      className="ml-2 size-6"
                    >
                      <Plus className="size-3" />
                    </Button>
                  </div>
                  <div className="border border-border rounded-lg p-4 space-y-4">
                    {values?.length <= 0 ? (
                      <div className="bg-light text-text-dark">
                        <p className="font-semibold text-center py-3 rounded-lg">
                          There are no items
                        </p>
                      </div>
                    ) : (
                      values?.map((value: any, index: number) => {
                        const key = item.fields
                          ? value?.title ||
                            value?.name ||
                            value?.label ||
                            value[Object?.keys(value)[0]] ||
                            item.name + " Item " + (index + 1)
                          : item.name + " Item " + (index + 1);

                        return (
                          <div
                            key={item.label + " " + index}
                            className="space-y-2"
                          >
                            {item.fields ? (
                              <Button
                                variant={"outline"}
                                type="button"
                                className="w-full flex justify-between pl-2.5 pr-0"
                                size={"lg"}
                                onClick={() =>
                                  handleNavigate({
                                    item,
                                    isNested,
                                    parent: item,
                                    index,
                                    label: key,
                                  })
                                }
                              >
                                <span className="capitalize">{key}</span>
                                <Pencil className="size-5 ml-auto mr-3" />

                                <Button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    removeItemFromArray(item, index);
                                  }}
                                  type="button"
                                  variant={"destructive"}
                                  size={"icon"}
                                  className="rounded-none text-inherit border-none outline-none h-full rounded-tr-md 
                                  transition-none rounded-br-md bg-transparent hover:bg-transparent hover:text-destructive/75"
                                >
                                  <Trash2 />
                                </Button>
                              </Button>
                            ) : (
                              <div className="relative">
                                <Button
                                  type="button"
                                  variant={"ghost"}
                                  className="absolute h-[calc(100%_-_5px)] right-0.5 top-1/2 -translate-y-1/2 "
                                  onClick={() =>
                                    removeItemFromArray(item, index)
                                  }
                                >
                                  <Trash2 className="size-5 absolute top-0 w-full h-full max-w-[20px] left-auto" />
                                </Button>

                                <Input
                                  className="pr-10"
                                  value={values[index] || ""}
                                  onChange={(e) =>
                                    handleInputChange({
                                      name: item.name,
                                      value: e.target.value,
                                      index,
                                      isNested: isNested,
                                    })
                                  }
                                />
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </AnimatedListItem>
              );
            } else {
              return (
                <AnimatedListItem key={item.name}>
                  <Button
                    variant={"outline"}
                    type="button"
                    className="w-full flex justify-between px-2.5"
                    size={"lg"}
                    onClick={() =>
                      handleNavigate({ item, isNested, parent: parent })
                    }
                  >
                    <span className="capitalize">
                      {item.label.toLowerCase()}
                    </span>
                    <Pencil className="size-5" />
                  </Button>
                </AnimatedListItem>
              );
            }
          })}
        </AnimatePresence>
      </ul>
    );
  }

  return (
    <div>
      {/* Breadcrumb Navigation */}
      <div>{renderItem({ schema, currentData: data })}</div>
    </div>
  );
}

function Description({ description }: { description?: string }) {
  if (!description) {
    return null;
  }

  return <p className={cn("text-sm text-muted-foreground")}>{description}</p>;
}

interface PreviewLabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  isRequired?: boolean;
  className?: string;
  children?: React.ReactNode;
}

function PreviewLabel({
  isRequired,
  children,
  className,
  ...props
}: PreviewLabelProps) {
  return (
    <Label className={className} {...props}>
      {children}
      {isRequired && <span className="text-destructive">*</span>}
    </Label>
  );
}
