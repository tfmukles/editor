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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { State } from "@/lib/context/type";
import { Pencil } from "lucide-react";
import { Dispatch, Fragment, SetStateAction, useState } from "react";

type Field = {
  label: string;
  type: "media" | "gallery" | "number" | "Date" | "string" | "Array" | "object";
  name: string;
  value: string;
  fields?: Field[];
};

export default function PreviewTina({
  schema,
  data,
  setData,
}: {
  schema: Field[];
  data: any;
  setData: Dispatch<SetStateAction<State | undefined>>;
}) {
  // Breadcrumb state stores names for internal navigation and labels for display
  const [breadcrumb, setBreadcrumb] = useState<
    { name: string; label: string }[]
  >([{ name: "Root", label: "Root" }]);

  // Helper function to access nested data based on breadcrumb
  const getNestedValue = (
    breadcrumb: { name: string; label: string }[],
    data: any,
  ): any => {
    return breadcrumb
      .slice(1)
      .reduce((acc, curr) => acc && acc[curr.name], data);
  };

  // Helper function to find fields based on breadcrumb names
  const getCurrentFields = (
    breadcrumb: { name: string; label: string }[],
    schema: Field[],
  ): Field[] => {
    let currentFields = schema;
    for (let i = 1; i < breadcrumb.length; i++) {
      const currentName = breadcrumb[i].name;
      const field = currentFields.find((f) => f.name === currentName);
      if (field && field.fields) {
        currentFields = field.fields;
      }
    }
    return currentFields;
  };

  // Helper function to update nested data
  const setNestedValue = (
    breadcrumb: { name: string; label: string }[],
    value: any,
  ) => {
    const newData = { ...data }; // Clone the data object
    let tempData = newData;

    // Traverse the data structure based on the breadcrumb to find the right location to set value
    for (let i = 1; i < breadcrumb.length - 1; i++) {
      const key = breadcrumb[i].name;

      // If the current key doesn't exist, initialize it as an empty object or array
      if (tempData[key] === undefined) {
        // Determine if we should initialize as an array or object based on the schema
        const nextBreadcrumb = breadcrumb[i + 1].name;
        const fieldInSchema = getCurrentFields(
          breadcrumb.slice(0, i + 1),
          schema,
        ).find((f) => f.name === key);

        tempData[key] = fieldInSchema?.type === "Array" ? [] : {};
      }

      tempData = tempData[key]; // Move to the next level
    }

    // Set the value at the final level
    const lastKey = breadcrumb[breadcrumb.length - 1].name;
    tempData[lastKey] = value;

    // Update the state
    setData((prev) => {
      if (!prev) return;
      return { ...prev, data: newData };
    });
  };

  // Current fields are derived from the breadcrumb path
  const currentFields = getCurrentFields(breadcrumb, schema);
  const currentData = getNestedValue(breadcrumb, data);

  // Update data based on field changes
  const handleInputChange = (name: string, value: any) => {
    const newPath = [...breadcrumb, { name, label: name }];
    setNestedValue(newPath, value);
  };

  // Navigate forward by adding the field name and label to the breadcrumb
  const handleNavigate = (item: Field) => {
    if (item.fields) {
      setBreadcrumb((prevBreadcrumb) => [
        ...prevBreadcrumb,
        { name: item.name, label: item.label },
      ]);
    }
  };

  // Navigate to a specific breadcrumb level
  const handleBreadcrumbClick = (index: number) => {
    setBreadcrumb((prevBreadcrumb) => prevBreadcrumb.slice(0, index + 1));
  };

  // Render fields recursively based on the schema
  function renderItem({ currentFields }: { currentFields: Field[] }) {
    return (
      <ul className="flex flex-col space-y-4">
        {currentFields?.map((item) => {
          if (item.type === "string") {
            return (
              <li key={item.name}>
                <Label>{item.label}</Label>
                <Input
                  value={currentData?.[item.name] || ""}
                  onChange={(e) => handleInputChange(item.name, e.target.value)}
                />
              </li>
            );
          } else if (item.type === "gallery") {
            const values = (
              Array.isArray(currentData[item.name])
                ? currentData?.[item.name]
                : []
            ) as string[];
            return (
              <li key={item.name}>
                <Label>{item.label}</Label>
                <div className="space-y-4">
                  {values.map((image) => {
                    return (
                      <div
                        key={image}
                        className={
                          "group max-w-sm relative after:absolute after:scale-0 after:origin-center after:left-0 after:top-0 after:w-full after:h-full after:bg-primary/40 rounded-lg after:rounded-[inherit] after:content-[''] after:opacity-0 after:invisible after:z-20 hover:after:visible hover:after:opacity-100 after:duration-300 hover:after:scale-100 after:transition-all"
                        }
                      >
                        <ImageUploader value={image}>
                          <ImagesList
                            name={item.name}
                            path={""}
                            onChangeHandler={() => {}}
                            className="cursor-pointer absolute z-30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          />
                        </ImageUploader>
                      </div>
                    );
                  })}
                </div>
              </li>
            );
          } else if (item.type === "media") {
            return (
              <li key={item.name}>
                <div>
                  <Label>{item.label}</Label>
                  <div
                    className={
                      "group max-w-sm relative after:absolute after:scale-0 after:origin-center after:left-0 after:top-0 after:w-full after:h-full after:bg-primary/40 rounded-lg after:rounded-[inherit] after:content-[''] after:opacity-0 after:invisible after:z-20 hover:after:visible hover:after:opacity-100 after:duration-300 hover:after:scale-100 after:transition-all"
                    }
                  >
                    <ImageUploader value={currentData?.[item.name]}>
                      <ImagesList
                        name={item.name}
                        path={""}
                        onChangeHandler={(val: any) =>
                          handleInputChange(item.name, val)
                        }
                        className="cursor-pointer absolute z-30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      />
                    </ImageUploader>
                  </div>
                </div>
              </li>
            );
          } else if (item.type === "Array") {
            return (
              <li key={item.name}>
                <Button
                  variant={"outline"}
                  type="button"
                  className="w-full flex justify-between h-auto py-4 border"
                  onClick={() => handleNavigate(item)}
                >
                  <span className="capitalize">{item.label}</span>
                  <Pencil className="size-5" />
                </Button>
              </li>
            );
          }

          return (
            <li key={item.name}>
              <Button
                variant={"outline"}
                type="button"
                className="w-full flex justify-between h-auto py-4 border"
                onClick={() => handleNavigate(item)}
              >
                <span className="capitalize">{item.label}</span>
                <Pencil className="size-5" />
              </Button>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div>
      {/* Breadcrumb Navigation */}
      <nav className="mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumb.map((crumb, index) => (
              <Fragment key={index}>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Button
                      onClick={() => handleBreadcrumbClick(index)}
                      variant={"link"}
                      type="button"
                      className="px-0"
                    >
                      {crumb.label}
                    </Button>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {index < breadcrumb.length - 1 && <BreadcrumbSeparator />}
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </nav>

      {renderItem({ currentFields })}
    </div>
  );
}
